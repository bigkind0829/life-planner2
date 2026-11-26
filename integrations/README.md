# External Integrations Boundary

This directory reserves the adapter seam for external tools so Life Planner's Markdown + YAML data contract stays clean, local-first, and portable.

## Active Integrations

- **Google Calendar (`gcalendar` plugin)**: Read-only ingestion of personal appointments and filtered exams/assessments (preserving external school calendars untouched; routine lectures hidden by default).
- **Local Web Dashboard (`dashboard/`)**: Zero-dependency `127.0.0.1` web console reading and writing `plans/YYYY/`, `profile/wealth.md`, and `projects/*/index.md` directly (100% compatible with Obsidian).

## Future Optional Adapters

- **Finance CSV Importer**: Drop monthly bank/card CSV statements into a local folder to auto-compute actual monthly spend and cashflow variance into `profile/wealth.md`.
- **Health Wearables** (e.g., Apple Health / Garmin): Feed weekly sleep and workout averages into `profile/vitality.md` and `logs/`.

## Adapter Contract Rules

1. External adapters write **normalized Markdown + YAML** matching `templates/` — they never require council agents to call external APIs directly.
2. Credentials and tokens stay in `.env` (gitignored) or Antigravity plugin auth — never inside `profile/`, `dashboard/`, or `integrations/`.
