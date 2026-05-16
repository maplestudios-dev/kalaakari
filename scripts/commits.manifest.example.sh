# ════════════════════════════════════════════════════════════════════════
#  commits.manifest.example.sh  —  template for new projects
#
#  HOW TO USE
#  1. Copy this file to scripts/commits.manifest.sh in your new project
#  2. Set REMOTE_URL to your new repo's URL
#  3. Edit define_commits to describe YOUR project's commit history
#  4. Run: bash scripts/git-init-and-push.sh --reinit --yes
#
#  STRUCTURE
#  • Set REMOTE_URL and DEFAULT_BRANCH at the top
#  • Define `define_commits` — a function called once after `git init`
#  • Inside it, call `commit_step` and `branch_here` to build history
#
#  HELPERS PROVIDED BY THE ENGINE
#
#    commit_step "key" "subject + body" file1 file2 ...
#       Stages the listed files, commits with the given message.
#       Files that don't exist are silently skipped (you can list more
#       than you have — handy for in-progress projects).
#       Returns 0 on success, 1 if nothing was committed.
#
#    branch_here "branch/name"
#       Creates a branch at HEAD with the given name.
#       Use after a commit_step via `&&` so a skipped commit doesn't
#       create a branch at the wrong commit.
#
#  TIPS
#  • The order of commit_step calls is the order of commits on main.
#  • Multi-line commit messages: just put a real newline inside the
#    quoted string. The first line becomes the subject; the rest the body.
#  • Feature branches are optional — only add `&& branch_here` where
#    you want a milestone marker.
#  • Lockfiles (pnpm-lock.yaml, package-lock.json) are usually best
#    committed LAST, after all dep changes have settled.
# ════════════════════════════════════════════════════════════════════════

# ─── Required config (CLI flags override these) ────────────────────
REMOTE_URL="https://github.com/your-org/your-repo.git"
DEFAULT_BRANCH="main"

# ─── Optional: env-var override pattern ────────────────────────────
# REMOTE_URL="${REMOTE_URL:-https://github.com/your-org/your-repo.git}"

# ─── The commit plan ───────────────────────────────────────────────
define_commits() {

  # First commit — minimal scaffold, no feature branch needed
  commit_step "init" \
    "chore: initialise repo

- README, .gitignore, .env.example
- Package manifest" \
    .gitignore .env.example README.md package.json

  # A feature: stage relevant files, commit, then branch
  commit_step "backend-foundation" \
    "feat(api): minimal Express server

- Express + helmet + CORS + morgan
- /api/health endpoint" \
    src/server.js src/middleware/*.js \
    && branch_here "feat/backend-foundation"

  commit_step "auth" \
    "feat(auth): JWT login + bcrypt password hashing

- /api/auth/login + /api/auth/me
- requireAuth middleware
- User model" \
    src/models/User.js src/routes/auth.js src/middleware/auth.js \
    && branch_here "feat/auth"

  # An incremental commit on top — no branch needed for this one
  commit_step "auth-rate-limit" \
    "feat(auth): rate-limit login attempts to 20 per 10 min" \
    src/middleware/rateLimit.js

  # A feature involving many files — list them all; missing ones are skipped
  commit_step "frontend" \
    "feat(web): Vite + React frontend with login form" \
    apps/web/package.json apps/web/vite.config.js apps/web/index.html \
    apps/web/src/main.jsx apps/web/src/App.jsx \
    apps/web/src/pages/Login.jsx apps/web/src/pages/Dashboard.jsx \
    && branch_here "feat/frontend"

  # Documentation usually lands as one final commit
  commit_step "docs" \
    "docs: README, architecture, API reference" \
    docs/ \
    && branch_here "docs/v1"

  # Lockfile last — reflects the final state of dependencies
  commit_step "lockfile" \
    "chore: commit lockfile for reproducible installs" \
    pnpm-lock.yaml package-lock.json yarn.lock

}
