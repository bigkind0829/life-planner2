# External Integrations Boundary (Phase 2)

This directory reserves the adapter seam for future external integrations without changing the core Markdown + YAML data contract used by the planner agents.

## Planned Phase 2 Adapters

- **Calendar** (e.g., Google Calendar): Sync fixed recurring/one-off events into `profile/schedule-constraints.md` and export confirmed daily time blocks.
- **Finance** (e.g., budgeting exports / CSV): Feed monthly cashflow summaries into `profile/wealth.md`.
- **Health** (e.g., wearables / Apple Health / Garmin): Feed weekly sleep and workout averages into `profile/vitality.md` and `logs/`.
- **Dashboard UI**: Local web application reading `profile/`, `plans/YYYY/`, `logs/`, and `council/` directly via YAML frontmatter.

## Adapter Contract Rules

1. External adapters write **normalized Markdown + YAML** matching `templates/`—they never require domain agents or planner skills to call external APIs directly.
2. Credentials and tokens must stay in `.env` (gitignored) or Antigravity plugin auth—never inside `profile/` or `integrations/`.
