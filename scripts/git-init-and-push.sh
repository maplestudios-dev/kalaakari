#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
#  git-init-and-push.sh  — generic engine
#
#  Initialises a fresh git repo for any project, runs a project-defined
#  commit manifest, creates feature branches at each milestone, and pushes
#  everything to the configured remote.
#
#  Project-agnostic. Configure via your manifest file (see
#  scripts/commits.manifest.example.sh) or via CLI flags / env vars.
#
#  Usage:
#    bash scripts/git-init-and-push.sh                 # interactive
#    bash scripts/git-init-and-push.sh --yes           # non-interactive
#    bash scripts/git-init-and-push.sh --yes -f        # force-push
#    bash scripts/git-init-and-push.sh --reinit        # wipe .git first
#    bash scripts/git-init-and-push.sh --dry-run       # build but don't push
#
#  Config (CLI flag wins over env var wins over manifest value):
#    --remote URL     | GIT_REMOTE     — remote git URL
#    --branch NAME    | GIT_BRANCH     — default branch (default: main)
#    --manifest PATH  | GIT_MANIFEST   — manifest file path
#                                        (default: scripts/commits.manifest.sh)
#
#  Auth: relies on existing git auth (gh, SSH key, or HTTPS credential helper).
# ════════════════════════════════════════════════════════════════════════

set -euo pipefail

CLI_REMOTE=""
CLI_BRANCH=""
CLI_MANIFEST=""
YES=0; FORCE=0; REINIT=0; DRY=0

show_help() { sed -n '2,28p' "$0"; }

while [ $# -gt 0 ]; do
  case "$1" in
    --remote)   CLI_REMOTE="$2"; shift 2 ;;
    --branch)   CLI_BRANCH="$2"; shift 2 ;;
    --manifest) CLI_MANIFEST="$2"; shift 2 ;;
    --yes|-y)   YES=1; shift ;;
    --force|-f) FORCE=1; shift ;;
    --reinit)   REINIT=1; shift ;;
    --dry-run)  DRY=1; shift ;;
    --help|-h)  show_help; exit 0 ;;
    *) echo "Unknown flag: $1" >&2; exit 2 ;;
  esac
done

# Resolve repo root from this script's location (parent of scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Manifest resolution: CLI > env > default
MANIFEST="${CLI_MANIFEST:-${GIT_MANIFEST:-scripts/commits.manifest.sh}}"
[ -f "$MANIFEST" ] || {
  echo "✗ Manifest not found: $MANIFEST" >&2
  echo "   See scripts/commits.manifest.example.sh for a template." >&2
  exit 1
}

# Source the manifest now to pick up REMOTE_URL / DEFAULT_BRANCH defaults
# and the define_commits function. The manifest must not have side effects
# at source time — it only sets variables and defines functions.
REMOTE_URL="${REMOTE_URL:-}"
DEFAULT_BRANCH="${DEFAULT_BRANCH:-main}"
# shellcheck source=/dev/null
. "$MANIFEST"

# CLI / env vars take precedence over manifest defaults
[ -n "$CLI_REMOTE" ]    && REMOTE_URL="$CLI_REMOTE"
[ -n "${GIT_REMOTE:-}" ] && [ -z "$CLI_REMOTE" ] && REMOTE_URL="$GIT_REMOTE"
[ -n "$CLI_BRANCH" ]    && DEFAULT_BRANCH="$CLI_BRANCH"
[ -n "${GIT_BRANCH:-}" ] && [ -z "$CLI_BRANCH" ] && DEFAULT_BRANCH="$GIT_BRANCH"

# Validate
[ -n "$REMOTE_URL" ] || {
  echo "✗ No remote URL configured." >&2
  echo "   Set one of:" >&2
  echo "     --remote https://github.com/<org>/<repo>.git" >&2
  echo "     GIT_REMOTE env var" >&2
  echo "     REMOTE_URL=\"...\" in your manifest file" >&2
  exit 1
}
command -v git >/dev/null || { echo "✗ git is not installed." >&2; exit 1; }
type define_commits >/dev/null 2>&1 || {
  echo "✗ Manifest must define a 'define_commits' function." >&2
  echo "   See scripts/commits.manifest.example.sh" >&2
  exit 1
}

# Handle existing .git
if [ -d .git ]; then
  if [ "$REINIT" -eq 1 ]; then
    echo "→ removing existing .git"
    rm -rf .git
  else
    echo "✗ .git already exists. Pass --reinit to wipe and rebuild." >&2
    exit 1
  fi
fi

# Surface local .env files (warning only — .gitignore handles them)
FOUND_ENVS=()
for f in .env apps/*/.env packages/*/.env services/*/.env; do
  [ -f "$f" ] && FOUND_ENVS[${#FOUND_ENVS[@]}]="$f"
done
if [ ${#FOUND_ENVS[@]} -gt 0 ]; then
  echo "ℹ Local .env files detected (will NOT be committed — .gitignore guards them):"
  for f in "${FOUND_ENVS[@]}"; do echo "   - $f"; done
fi

# Confirm
if [ "$YES" -ne 1 ]; then
  echo
  echo "ABOUT TO:"
  echo "  • git init in $REPO_ROOT"
  echo "  • remote: $REMOTE_URL"
  echo "  • branch: $DEFAULT_BRANCH"
  echo "  • run manifest: $MANIFEST"
  [ "$FORCE" -eq 1 ] && echo "  • force-push (will overwrite remote)"
  [ "$DRY" -eq 1 ]   && echo "  • DRY RUN: skipping the actual push"
  echo
  read -r -p "Proceed? [y/N] " ans
  [[ "$ans" =~ ^[Yy]$ ]] || { echo "aborted."; exit 0; }
fi

# Init
git init -q -b "$DEFAULT_BRANCH"
git remote add origin "$REMOTE_URL"
git config user.name  "$(git config --global user.name  || echo 'Studio Dev')"
git config user.email "$(git config --global user.email || echo 'dev@studio.local')"
echo "✓ repo initialised, remote → $REMOTE_URL"
echo

# ─── Helpers exposed to the manifest ───────────────────────────────
# Stage the listed paths (silently skipping missing ones), commit if
# anything is staged. Returns 0 on success, 1 if nothing was committed.
commit_step() {
  local key="$1" msg="$2"; shift 2
  local p
  local existing=()
  for p in "$@"; do
    [ -e "$p" ] && existing[${#existing[@]}]="$p"
  done
  if [ ${#existing[@]} -eq 0 ]; then
    echo "skip [$key] — no matching files"
    return 1
  fi
  git add -- "${existing[@]}"
  if git diff --cached --quiet; then
    echo "skip [$key] — nothing new staged"
    return 1
  fi
  git commit -q -m "$msg"
  local sha first
  sha=$(git rev-parse HEAD)
  first="${msg%%$'\n'*}"
  printf "✓ [%-22s] %s  (%s)\n" "$key" "$first" "${sha:0:7}"
  return 0
}

# Create a branch at HEAD with the given name (no-op if it already exists).
branch_here() {
  local name="$1"
  if git show-ref --verify --quiet "refs/heads/$name"; then
    echo "  → $name already exists, leaving as is"
  else
    git branch "$name" HEAD
    printf "  → %-30s @ %s\n" "$name" "$(git rev-parse --short HEAD)"
  fi
}

# Run the project-specific commit plan
define_commits

# ─── Push ──────────────────────────────────────────────────────────
echo
if [ "$DRY" -eq 1 ]; then
  echo "DRY RUN — skipping push. Re-run without --dry-run to push for real."
  echo
  echo "Would push:"
  git branch --format='  - %(refname:short)'
else
  if [ "$FORCE" -eq 1 ]; then
    echo "Pushing ${DEFAULT_BRANCH} (force)..."
    git push -u --force origin "${DEFAULT_BRANCH}"
    echo "Pushing all feature branches (force)..."
    git push -u --force origin --all
  else
    echo "Pushing ${DEFAULT_BRANCH}..."
    git push -u origin "${DEFAULT_BRANCH}"
    echo "Pushing all feature branches..."
    git push -u origin --all
  fi
fi

# ─── Summary ───────────────────────────────────────────────────────
echo
echo "============================================================"
echo "  Done."
echo
echo "  Repo:     $REMOTE_URL"
echo "  Branch:   $DEFAULT_BRANCH"
echo "  Manifest: $MANIFEST"
echo "  Commits:  $(git rev-list --count HEAD)"
echo "  Branches:"
git branch --format='    - %(refname:short)'
echo "============================================================"
