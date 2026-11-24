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
- Active monthly plan: `plans/YYYY/monthly/YYYY-MM.md` *(if missing, run standalone using `profile/` priorities with `parent_id: null` and offer `/strategy-review` afterward)*
- `profile/schedule-constraints.md` (apply `active_mode`: `semester` / `exam` / `vacation`)
- `profile/vitality.md` (floor only)
- `## Next Actions` and `## Milestones` (lightweight status check only) from `projects/*/index.md` ONLY for projects with `status: "active"` *(never summon subsidiary agents here; if an active project has no Next Actions listed or its current milestone is completed, show a 1-line notice at the top of the weekly plan — e.g., `"완료된 마일스톤이 있습니다 — /project-manage에서 다음 퀘스트·신상품 3안을 추천받을까요?"`)*
- At most 1 previous weekly plan (`plans/YYYY/weekly/YYYY-W<prev>.md`) and at most the last 7 daily check-in files from `logs/` (if present)

### 2. Graceful Review & Escalation Check

- If the user missed last week's review or several daily check-ins, **never scold**. Summarize what was recorded, ask 2–3 quick questions (what actually happened, energy level, next week's unusual fixed events), and triage carry-overs cleanly (do / defer / drop).
- Check the **Escalation Thresholds**:
  - Have core weekly targets missed for **2 consecutive weeks** (`consecutive_miss_weeks >= 2`)?
  - Was a non-negotiable floor breached (`floors_ok: false`)?
  - Did the user ask to change Monthly/Quarterly/Yearly goals?
- If any trigger fires, flag it clearly and offer to run `/rebalance` before locking an unrealistic week.

### 3. Draft & Confirm Weekly Time-Blocked Plan

Follow **Priority-Driven Zero-Sum Allocation (Hard 100% Cap)**:
1. Pull requirements from active requirement files (`profile/`, active Monthly Priority Stack, and `## Next Actions` of funded `projects/*/index.md`) without waking subagents.
2. Lock **P0** first (fixed weekly commitments + survival sleep floor + ~20% daily buffer).
3. Allocate remaining weekly hours strictly in **Priority Stack order (`P1 → P2 → ... → PN`)** into concrete day-level time blocks. **Total allocated hours MUST NOT exceed 100% of available capacity** — any overflow from lower-priority items is transparently deferred instead of overbooked.

Present the proposed week cleanly for quick user tweaks, then write `plans/YYYY/weekly/YYYY-Www.md` following `templates/plans/weekly.md` with valid YAML frontmatter (`id: "YYYY-Www"`, `parent_id: "YYYY-MM"`, `consecutive_miss_weeks`, `floors_ok`).
