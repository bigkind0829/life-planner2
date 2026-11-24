---
name: sync-github
description: Privacy-safe Git commit and GitHub push workflow for Life Planner. Verifies zero personal data files are staged before committing and pushing system updates (.agents/, AGENTS.md, templates/, integrations/, README.md, dashboard/).
---

# Sync GitHub (Privacy-Safe System Push)

Safely commit and push Life Planner system improvements to GitHub while guaranteeing personal life data never leaks.

## Hard Privacy Guardrail

NEVER stage, commit, or push files inside:
- `profile/`
- `plans/`
- `logs/`
- `council/`
- `.scratch/`
- `.env` or credential/key files

If ANY file under those paths appears in `git status --short` or `git diff --cached --name-only`, **STOP immediately**, verify `.gitignore`, unstage those files, and warn the user in full clear sentences.

## Process

### 1. Check Repository & Remote State

Run `git status --short` and `git remote -v`:
- If this folder is not a Git repository yet, ask the user for confirmation before running `git init` and adding their GitHub remote URL.
- If no `origin` remote is configured, ask the user for the GitHub repository URL and set it (`git remote add origin <url>`).

### 2. Privacy & Diff Audit

1. Verify `.gitignore` contains `profile/`, `plans/`, `logs/`, `council/`, `.scratch/`, `.env`.
2. Inspect `git status --short` and verify ONLY allowed system paths are modified/untracked (`.agents/`, `AGENTS.md`, `README.md`, `.gitignore`, `templates/`, `integrations/`, and future `dashboard/`).
3. Present the exact list of files to commit and a concise proposed commit message.

### 3. Confirm & Push

1. **Always obtain explicit user confirmation** before executing `git push` (unless the user explicitly instructed committing and pushing these exact changes in the current turn).
2. Stage only verified system files (`git add .gitignore AGENTS.md README.md .agents/ templates/ integrations/`), double-check `git diff --cached --name-only` contains zero forbidden paths, commit with a clear message, and run `git push`.
3. Report the pushed commit hash, branch, and file count.
