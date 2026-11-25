---
name: daily-plan
description: Tactical Planner for fast morning time-blocked schedules (priority-ordered variable task count within 100% daily capacity + 20% buffer), 3-minute evening check-ins, live conversational rescheduling, and guilt-free recovery after missed days. Runs with 0 subagent calls.
---

# Daily Plan (Tactical Planner — Daily Timetable, Check-in & Ad-Hoc Reschedule)

Run ultra-lightweight daily execution with **0 subagent calls**.

## Speed & Isolation Rule

Do **NOT** summon any council subagents or `project-lead` here. Read ONLY the active Weekly plan (`plans/YYYY/weekly/YYYY-Www.md`), `profile/schedule-constraints.md` (`active_mode`), active P0/priority requirements (`profile/`, funded `projects/*/index.md`), and at most 1 previous day's plan/log (if available).
- **Standalone Fallback**: If no active Weekly plan exists yet, derive today's priority-ordered timetable from `profile/` priorities using `parent_id: null`, and briefly offer `/weekly-plan` or `/strategy-review` when ready.

## Modes

Detect which mode fits the user's message:

### Mode A: Morning Timetable (1–2 Minutes)

1. Check if previous days were missed. **Graceful Absence Recovery**: never lecture or carry forward a mountain of stale overdue tasks. Reset cleanly to today and ask only if 1–2 past items still matter.
2. Build a **concrete time-blocked timetable** strictly inside **100% of today's available hours**:
   - Place **P0** first (fixed obligations, survival sleep floor, and **~20% buffer** `buffer_ratio: 0.20`).
   - Fill remaining time blocks in active **Priority Stack order (`P1 → P2 → ... → PN`)** with a **variable task count** — no artificial 3-task limit; add only what physically fits on the timetable, tag must-not-miss tasks with `[핵심]`, and push overflow cleanly out of today's sheet.
3. Write `plans/YYYY/daily/YYYY-MM-DD.md` following `templates/plans/daily.md` with valid YAML frontmatter (`id: "YYYY-MM-DD"`, `parent_id: "YYYY-Www"`).

### Mode B: Evening Check-in (3 Minutes)

Ask at most 3 ultra-brief prompts (or parse what the user already told you):
1. Which scheduled blocks finished today (and what moves or gets dropped)?
2. Energy level today (`1–5`) and did P0 survival floors hold?
3. Any sudden schedule change for tomorrow?

Write `logs/YYYY-MM-DD-checkin.md` following `templates/logs/daily-checkin.md`, update today's `progress` and `status: "completed"` in `plans/YYYY/daily/YYYY-MM-DD.md`, and draft tomorrow's adjusted timetable if helpful.

### Mode C: Live Mid-Day Reschedule

When the user says an unexpected meeting, fatigue, or event disrupted today's schedule:
1. Absorb the change inside today's 20% buffer first, then drop/defer the **lowest-priority (`PN` upward)** blocks from today's timetable so total scheduled time stays `≤ 100%`.
2. **Never sacrifice P0 survival floors silently** to squeeze in delayed work — if rescheduling threatens P0, warn explicitly (`floors_ok: false`) and suggest dropping lower-priority blocks or running `/strategy-review` (**Rebalance Mode**).
3. Update `plans/YYYY/daily/YYYY-MM-DD.md` immediately and log the adjustment under `## Quick Notes / Ad-Hoc Changes`.
