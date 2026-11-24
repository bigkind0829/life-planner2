---
name: daily-plan
description: Tactical Planner for 1-minute morning daily plans (Top 3 MITs, time blocks, 20% buffer), 3-minute evening check-ins, live conversational rescheduling, and guilt-free recovery after missed days.
---

# Daily Plan (Tactical Planner — Daily Briefing, Check-in & Ad-Hoc Reschedule)

Run ultra-lightweight daily execution without invoking the 6 domain subagents.

## Speed & Isolation Rule

Do **NOT** summon the 6 domain subagents here. Read only the active Weekly plan (`plans/YYYY/weekly/YYYY-Www.md`), `profile/schedule-constraints.md`, `profile/vitality.md` floor, and yesterday's plan/log (if available).

## Modes

Detect which mode fits the user's message:

### Mode A: Morning Plan (1 Minute)

1. Check if previous days were missed. **Graceful Absence Recovery**: never lecture or carry forward a mountain of stale overdue tasks. Reset cleanly to today and ask only if 1–2 past items still matter.
2. Pick **Top 3 MITs (Most Important Tasks)** aligned with the active Weekly plan.
3. Lay out key time blocks around fixed obligations and floors, explicitly reserving **~20% buffer** (`buffer_ratio: 0.20`) for overflow and rest.
4. Write `plans/YYYY/daily/YYYY-MM-DD.md` following `templates/plans/daily.md` with valid YAML frontmatter (`id: "YYYY-MM-DD"`, `parent_id: "YYYY-Www"`).

### Mode B: Evening Check-in (3 Minutes)

Ask at most 3 ultra-brief prompts (or parse what the user already told you):
1. Which of the 3 MITs finished (and what moves or gets dropped)?
2. Energy level today (`1–5`) and did sleep/health/other floors hold?
3. Any sudden schedule change for tomorrow?

Write `logs/YYYY-MM-DD-checkin.md` following `templates/logs/daily-checkin.md`, update today's `progress` and `status: "completed"` in `plans/YYYY/daily/YYYY-MM-DD.md`, and draft tomorrow's adjusted 3 MITs if helpful.

### Mode C: Live Mid-Day Reschedule

When the user says an unexpected meeting, fatigue, or event disrupted today's schedule:
1. Absorb the change inside today's 20% buffer first, then reshuffle or defer lower-priority tasks within the current week.
2. **Never sacrifice the sleep/vitality floor silently** to squeeze in delayed work—if rescheduling threatens a floor, warn explicitly (`floors_ok: false`) and suggest either dropping a task or running `/rebalance`.
3. Update `plans/YYYY/daily/YYYY-MM-DD.md` immediately and log the adjustment under `## Quick Notes / Ad-Hoc Changes`.
