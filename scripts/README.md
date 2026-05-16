# scripts/

Reusable git-history bootstrapper for any project.

## What's in here

| File | Purpose | Edit per project? |
|---|---|---|
| `git-init-and-push.sh` | The engine. Handles `git init`, helpers, push, summary. | No — works everywhere. |
| `commits.manifest.sh` | The current project's commit plan (REMOTE_URL + `define_commits`). | Yes — this is the per-project file. |
| `commits.manifest.example.sh` | Annotated template to copy into a new project. | Reference only. |

## How it works

1. The engine sources your manifest to pick up `REMOTE_URL`, `DEFAULT_BRANCH`, and your `define_commits` function.
2. CLI flags (`--remote`, `--branch`) and env vars (`GIT_REMOTE`, `GIT_BRANCH`) override the manifest values.
3. After validating config and (optionally) wiping `.git`, the engine `git init`s, defines `commit_step` + `branch_here` helpers, then calls your `define_commits`.
4. After all commits + branches are created, it pushes `main` and all feature branches.

## Use it on a new project

```bash
# in a new project's repo root
mkdir -p scripts
cp /path/to/kalaakaari/scripts/git-init-and-push.sh scripts/
cp /path/to/kalaakaari/scripts/commits.manifest.example.sh scripts/commits.manifest.sh

# Edit scripts/commits.manifest.sh:
#   • set REMOTE_URL = "https://github.com/your-org/your-repo.git"
#   • fill in define_commits with your project's commit_step calls

# Dry-run first to verify the plan
bash scripts/git-init-and-push.sh --dry-run

# Push for real
bash scripts/git-init-and-push.sh --yes
```

## CLI reference

```
bash scripts/git-init-and-push.sh [flags]

  --remote URL      git remote URL              (overrides manifest)
  --branch NAME     default branch name         (overrides manifest, default: main)
  --manifest PATH   path to manifest            (default: scripts/commits.manifest.sh)
  --yes, -y         skip the interactive confirm
  --force, -f       force-push (overwrites remote — destructive)
  --reinit          wipe existing .git first
  --dry-run         build commits locally but don't push
  --help, -h        show inline help
```

Env-var equivalents: `GIT_REMOTE`, `GIT_BRANCH`, `GIT_MANIFEST`.

## Helpers inside `define_commits`

```bash
commit_step "key" "subject line\n\noptional body" file1 file2 dir/   # stage + commit
branch_here "feat/<name>"                                            # branch at HEAD
```

Chain them with `&&` so a skipped commit doesn't accidentally create a branch at the wrong commit:

```bash
commit_step "rbac" "feat(rbac): roles + permissions" \
  src/models/User.js src/routes/users.js src/lib/permissions.js \
  && branch_here "feat/rbac"
```

## What is NEVER committed

The project's `.gitignore` does the gatekeeping. The template in this repo blocks:

- `node_modules/`, build artifacts (`dist/`, `.next/`, `.vite/`, `.turbo/`)
- **`.env`** and all variants (`*.local`, `*.production`, per-app paths) — secrets never leave the machine
- `.DS_Store`, editor folders (`.vscode/`, `.idea/`)
- Logs, coverage, deploy-tool local state

What IS committed:
- `.env.example` (template only — no values)
- `pnpm-lock.yaml` / `package-lock.json` (reproducible installs)
- All source + docs + scripts

## Auth

The engine uses whatever git auth you already have configured — `gh auth login`, an SSH key, or an HTTPS credential helper. The script doesn't handle login itself; it just runs `git push`.

If HTTPS prompts and you'd prefer SSH:
```bash
git remote set-url origin git@github.com:<org>/<repo>.git
```

## Bash compatibility

Targets bash 3.2 (macOS default) — no associative arrays, no fancy syntax. Tested on macOS and Linux.
