---
name: weekly-plan
description: Tactical Planner for automated weekly plans (Sunday 20:30 auto-draft + daily rolling updates). Runs with 0 subagent calls, pulls Next Actions from active projects/*/index.md, checks escalation triggers, and writes plans/YYYY/weekly/YYYY-Www.md with check-ahead tasks for dashboard/.
---

# Weekly Plan (Tactical Planner — Weekly Auto-Draft & Rolling Sync)

Create or refresh the weekly time-blocked plan automatically with **0 subagent calls**, grounded in the approved Monthly strategy and real-world calendar constraints.

## Speed & Isolation Rule

Do **NOT** summon any council subagents (`guardian`, `growth`, `world-radar`) or `project-lead` during normal `/weekly-plan` runs.

## Process

### 1. Gather Lightweight Context

Read ONLY:
- Active monthly plan: `plans/YYYY/monthly/YYYY-MM.md` *(if missing, run standalone using `profile/` priorities with `parent_id: null` and offer `/strategy-review` afterward)*
- `profile/schedule-constraints.md` (apply date-bounded fixed commitments & Google Calendar filtering rules — hide regular school lectures, include personal events + exams/assessments; read lecture list read-only only if explicitly planning exam scope)
- `profile/vitality.md` (P0 floor only)
- `## Next Actions` and `## Milestones` from `projects/*/index.md` ONLY for projects with `status: "active"` and `weekly_quota_hours > 0` *(never summon `project-lead` here; if an active project has no Next Actions or a completed milestone, add a 1-line note in `## Auto-Adjustment Log` suggesting `/project-manage`)*
- At most 1 previous weekly plan (`plans/YYYY/weekly/YYYY-W<prev>.md`) and at most the last 7 daily check-in files from `logs/` (if present)

### 2. Carry-Over Triage & Escalation Check

- Triage incomplete items from the previous week without scolding (`do` / `defer` / `drop`).
- Check **Escalation Thresholds**:
  - `P1` core targets physically cannot fit within the week (`needs_approval: true`)?
  - Core weekly targets missed for **2 consecutive weeks** (`consecutive_miss_weeks >= 2`)?
  - Non-negotiable P0 floor breached (`floors_ok: false`)?
  - User explicitly requested changing Monthly/Quarterly/Yearly goals?
- If any trigger fires, set `needs_approval: true`, write the exact shortfall/trigger in `## Auto-Adjustment Log`, and prompt for `/strategy-review` (**Rebalance Mode**).

### 3. Write Weekly Plan With Dashboard-Ready Check-Ahead List

Follow **Priority-Driven Zero-Sum Allocation (Hard 100% Cap)**:
1. Lock **P0** first (date-bounded fixed commitments + personal/exam calendar blocks + survival sleep floor + ~20% daily buffer).
2. Allocate remaining weekly hours strictly in **Priority Stack order (`P1 → P2 → ... → PN`)** into day-level blocks (`≤ 100%`). Auto-defer `P2–PN` overflow transparently; never silently drop `P1`.
3. Populate `## Upcoming Tasks (Check Ahead)` with concise `- [ ] [Day MM/DD] [P#] ...` lines so the user can check off ahead-of-schedule tasks directly in `dashboard/` or Obsidian.

Write `plans/YYYY/weekly/YYYY-Www.md` matching `templates/plans/weekly.md` with valid YAML frontmatter (`id`, `parent_id`, `consecutive_miss_weeks`, `floors_ok`, `needs_approval`).
