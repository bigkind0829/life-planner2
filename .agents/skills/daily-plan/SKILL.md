---
name: daily-plan
description: Tactical Auto-Replanner for daily time-blocked schedules and rolling weekly updates (06:00 automated or catch-up). Reads dashboard checkmarks, ahead-of-schedule weekly checkmarks, exception notes, and Google Calendar; auto-archives logs; enforces ≤100% cap with P2-PN auto-defer and P1 approval banner. Runs with 0 subagent calls.
---

# Daily Plan (Tactical Auto-Replanner & Ad-Hoc Reschedule)

Run ultra-lightweight daily & rolling weekly scheduling with **0 subagent calls**. No mandatory evening check-in conversation — the user checks boxes in `dashboard/` (or Obsidian) and only messages for unexpected mid-day changes or exceptions.

## Speed & Isolation Rule

Do **NOT** summon any council subagents or `project-lead` here. Read ONLY:
- Active Weekly plan: `plans/YYYY/weekly/YYYY-Www.md` (including `## Upcoming Tasks (Check Ahead)` for `[x]` ahead-of-schedule items)
- Previous day's Daily plan: `plans/YYYY/daily/YYYY-MM-<prev>.md` (checkmarks `[x]`/`[ ]`/`[-]` and `## Quick Notes / Ad-Hoc Changes`)
- `profile/schedule-constraints.md` (date-bounded fixed commitments & calendar filtering rules)
- `profile/vitality.md` (P0 survival floor only)
- `## Next Actions` from active funded `projects/*/index.md` (`status: "active"`, `weekly_quota_hours > 0`)
- Google Calendar (`gcalendar readonly events`): personal `primary` events + school calendar **exams/assessments only** (hide regular lectures by default while preserving original calendar untouched).

## Modes

### Mode A: Morning Auto-Replan & Rolling Weekly Sync (06:00 Automated or Catch-Up)

1. **Ingest Yesterday's Checkmarks & Notes (Graceful Absence Recovery)**:
   - Inspect yesterday's daily plan (`[x]` done, `[ ]` incomplete, `[-]` skipped) and `## Quick Notes / Ad-Hoc Changes`.
   - If multiple days were missed, **never scold** — cleanly reset to today and triage only still-relevant items.
   - Auto-archive a concise summary of yesterday's completed/deferred items to `logs/YYYY-MM-<prev>-checkin.md` matching `templates/logs/daily-checkin.md` (no chat check-in required).
2. **Deduct Ahead-of-Schedule Weekly Items**:
   - Inspect `## Upcoming Tasks (Check Ahead)` in the active Weekly plan. Any item checked `[x]` early is deducted from today's/this week's remaining workload and noted in `## Auto-Adjustment Log`.
3. **Build Today's Timetable (`≤ 100%` Capacity + ~20% Buffer)**:
   - Lock **P0** first (date-bounded fixed commitments, personal calendar appointments, exam blocks, survival sleep floor, and ~20% buffer `buffer_ratio: 0.20`).
   - Fill remaining time strictly in **Priority Stack order (`P1 → P2 → ... → PN`)** with carried-over items + scheduled tasks. Tag must-not-miss tasks with `[핵심]`.
   - **Auto-Deferral vs. P1 Approval Boundary**:
     - If total work exceeds 100% capacity, automatically defer **`P2–PN`** items bottom-up into `## Deferred / Overflow` and log a crisp 2–3 line explanation in `## Auto-Adjustment Log`.
     - If **`P1` (`[핵심]`)** items physically cannot fit into today/this week without breaking P0 floors, **NEVER silently drop `P1`**: schedule the safest `P0 + P1` subset, set `needs_approval: true` in YAML frontmatter (on both Daily and Weekly plans), and write a clear **Approval Request** in `## Auto-Adjustment Log` listing the exact hour shortfall and 2–3 concrete drop/defer options.
4. **Write Today's Daily Plan & Roll Forward Weekly Plan**:
   - Write `plans/YYYY/daily/YYYY-MM-DD.md` matching `templates/plans/daily.md` (using the exact `| Time | Priority | Task / Block | Status |` table with `[ ]` so `dashboard/` renders clickable checkboxes immediately).
   - Update `plans/YYYY/weekly/YYYY-Www.md` (rolling update: sync `## Auto-Adjustment Log`, remove/check completed items in `## Upcoming Tasks (Check Ahead)`, adjust remaining days' blocks, and update `progress` & `needs_approval`).

### Mode B: Live Mid-Day Reschedule & Ad-Hoc Exception

When the user mentions an unexpected appointment, fatigue, or schedule change (in chat or via dashboard Quick Notes):
1. Absorb the disruption inside today's 20% buffer first, then defer the **lowest-priority (`PN` upward)** blocks from today's timetable so total scheduled time stays `≤ 100%`.
2. **Never sacrifice P0 survival floors silently** — if the disruption threatens P0 or `P1`, set `floors_ok: false` or `needs_approval: true` and ask which item to drop/defer (or offer `/strategy-review` Rebalance Mode).
3. Update `plans/YYYY/daily/YYYY-MM-DD.md` immediately and append a timestamped line under `## Quick Notes / Ad-Hoc Changes`.
