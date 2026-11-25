---
domain: "schedule-constraints"
stage: "minimal"
updated_at: "YYYY-MM-DD"
timezone: "Asia/Seoul"
min_sleep_hours: 7
sleep_window: "23:30-07:00" # or "flexible"
daily_buffer_ratio: 0.20
---

# Schedule Constraints (Shared Time Resource)

Manage changing periods (e.g., semester, exam sprint, vacation) simply through **date-bounded fixed commitments** and **Monthly/Quarterly Zero-Sum priority allocations (`weekly_quota_hours: 0` when paused)** — no global mode switch required.

## Active Fixed Commitments (Date-Bounded)

| Period | Day | Time Window | Commitment | Flexibility |
| :--- | :--- | :--- | :--- | :--- |
| Always | Daily | `min_sleep_hours` | Sleep floor | Non-negotiable |
| YYYY-MM-DD – YYYY-MM-DD | Mon–Fri | 09:00–18:00 | Main work / school | Fixed |

- **Weekday focus hours available**: e.g., 1.5h/day
- **Weekend focus hours available**: e.g., 4h/weekend
- **Protected recovery/rest blocks**: e.g., Sunday afternoon

## Calendar Integration Rules

- **Primary calendar**: Include all personal appointments and commitments.
- **Secondary / School calendar (Optional, Read-Only)**: Preserve original events untouched; hide routine lectures from daily timetables while filtering exams/assessments. Read lecture topics read-only only when building exam study plans.

## Upcoming Fixed Events & Deadlines

| Date(s) | Event | Notes |
| :--- | :--- | :--- |
| YYYY-MM-DD | Key deadline or exam | |

## Energy Pattern

- **Peak focus window**: e.g., 07:30–11:00
- **Low energy window**: e.g., 14:00–16:00
