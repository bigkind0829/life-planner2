---
id: "YYYY-MM-DD"
period: "daily"
parent_id: "YYYY-W01"
status: "active"
start_date: "YYYY-MM-DD"
end_date: "YYYY-MM-DD"
progress: 0
domains:
  - vitality
  - mastery
floors_ok: true
needs_approval: false
buffer_ratio: 0.20
updated_at: "YYYY-MM-DD"
---

# YYYY-MM-DD Daily Plan

## Auto-Adjustment Log

- *(Automatic carry-overs, ahead-of-schedule deductions, or P2–PN deferrals from 06:00 auto-replan. If `needs_approval: true`, state the exact P1 capacity shortfall and options here.)*

## Concrete Time-Blocked Timetable (≤ 100% Capacity, ~20% Buffer)

> Ordered by active Priority Stack (`P0` fixed obligations + survival floor + ~20% buffer first, then `P1 → PN`). Status markers synced with `dashboard/`: `[ ]` pending, `[x]` completed, `[-]` skipped. Tag must-not-miss tasks with `[핵심]`.

| Time | Priority | Task / Block | Status |
| :--- | :---: | :--- | :---: |
| 07:00–08:00 | P0 | Morning routine / Fixed commitment | [ ] |
| 08:30–11:30 | P1 | **[핵심]** Primary focus block | [ ] |
| 12:00–13:00 | P0 | Lunch & break (Buffer) | [ ] |
| 13:30–16:30 | P1/P2 | Scheduled focus / fixed commitment | [ ] |
| 17:00–18:30 | P0 | Buffer / Overflow / Rest (~20%) | [ ] |
| 19:00–21:00 | P2/P3 | Secondary priority block | [ ] |
| 23:30–07:00 | P0 | Sleep (Non-negotiable) | [ ] |

## Deferred / Overflow (Outside Today's 100% Cap)

- *(Lower-priority P2–PN tasks automatically deferred to stay ≤ 100%)*

## Quick Notes / Ad-Hoc Changes

- *(User exception notes from dashboard or chat — read by the next 06:00 auto-replan)*
