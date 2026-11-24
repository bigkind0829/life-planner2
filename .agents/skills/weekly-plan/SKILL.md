---
name: weekly-plan
description: Tactical Planner for weekly reviews and weekly time-blocked plans. Runs fast without summoning the 6 domain subagents, checks floor compliance and consecutive missed-week escalation triggers, and writes plans/YYYY/weekly/YYYY-Www.md.
---

# Weekly Plan (Tactical Planner — Weekly)

Create or update the weekly time-blocked plan quickly using the active Monthly plan and reality constraints.

## Speed & Isolation Rule

Do **NOT** summon the 6 domain subagents during normal `/weekly-plan` runs. Keep this workflow fast, lightweight, and grounded in the already-approved Monthly strategy.

## Process

### 1. Gather Lightweight Context

Read ONLY:
- Active monthly plan: `plans/YYYY/monthly/YYYY-MM.md`
- `profile/schedule-constraints.md`
- `profile/vitality.md` (floor only)
- Previous weekly plan (`plans/YYYY/weekly/YYYY-W<prev>.md`) and recent check-in logs from `logs/` (if present)

### 2. Graceful Review & Escalation Check

- If the user missed last week's review or several daily check-ins, **never scold**. Summarize what was recorded, ask 2–3 quick questions (what actually happened, energy level, next week's unusual fixed events), and triage carry-overs cleanly (do / defer / drop).
- Check the **Escalation Thresholds**:
  - Have core weekly targets missed for **2 consecutive weeks** (`consecutive_miss_weeks >= 2`)?
  - Was a non-negotiable floor breached (`floors_ok: false`)?
  - Did the user ask to change Monthly/Quarterly/Yearly goals?
- If any trigger fires, flag it clearly and offer to run `/rebalance` before locking an unrealistic week.

### 3. Draft & Confirm Weekly Time-Blocked Plan

Follow **Constrained Top-Down**:
1. Place fixed weekly commitments + `vitality` sleep/exercise floor + protected `connection-joy` rest block first.
2. Select **at most 3 Weekly Core Targets** directly advancing the active Monthly plan.
3. Map targets into realistic day-level focus blocks while keeping ~20% daily buffer slack.

Present the proposed week cleanly for quick user tweaks, then write `plans/YYYY/weekly/YYYY-Www.md` following `templates/plans/weekly.md` with valid YAML frontmatter (`id: "YYYY-Www"`, `parent_id: "YYYY-MM"`, `consecutive_miss_weeks`, `floors_ok`).
