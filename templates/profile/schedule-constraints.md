---
domain: "schedule-constraints"
stage: "minimal"
updated_at: "YYYY-MM-DD"
timezone: "Asia/Seoul"
active_mode: "semester" # semester | exam | vacation
min_sleep_hours: 7
sleep_window: "23:30-07:00" # or "flexible"
daily_buffer_ratio: 0.20
---

# Schedule Constraints (Shared Time Resource)

## Schedule Modes

Switch `active_mode` in YAML frontmatter as periods change so plans adapt without rewriting tables from scratch.

### Mode: `semester` (Default / Routine)

| Day | Time Window | Commitment | Flexibility |
| :--- | :--- | :--- | :--- |
| Mon–Fri | 09:00–18:00 | Main work / school | Fixed |
| Daily | min_sleep_hours | Sleep floor | Non-negotiable |

- **Weekday focus hours available**: e.g., 1.5h/day
- **Weekend focus hours available**: e.g., 4h/weekend
- **Protected recovery/rest blocks**: e.g., Sunday afternoon

### Mode: `exam` (High-Intensity Academic / Sprint)

- **Priority override**: Academic / core deliverables take top share; pause optional side projects and scale down flexible commitments.
- **Floors preserved**: `min_sleep_hours` + minimum recovery; `daily_buffer_ratio` preserved against burnout.

### Mode: `vacation` (Open / Transition Period)

- **Fixed commitments**: Reduced; reallocate newly freed weekday blocks to top quarterly goals (`wealth`, `mastery`) while protecting `vitality` and `connection-joy`.
- **Weekday / Weekend focus hours available**: Update when vacation starts.

## Energy Pattern

- **Peak focus window**: e.g., 07:30–11:00
- **Low energy window**: e.g., 14:00–16:00
