---
name: onboard-life
description: Two-stage progressive onboarding workflow for Life Planner. Use to initialize core values, health floor, fixed schedule, and top yearly goals in ~10 minutes (Stage 1), or incrementally enrich individual domains (Stage 2).
---

# Onboard Life (2-Stage Progressive Onboarding)

Set up or enrich the user's personal files under `profile/` without causing onboarding fatigue.

## Process

### 1. Inspect Current Profile State

Check which files already exist in `profile/`:
- `profile/north-star.md`
- `profile/vitality.md`
- `profile/schedule-constraints.md`
- `profile/wealth.md`
- `profile/mastery.md`
- `profile/connection-joy.md`
- `profile/world-radar.md`

Never silently overwrite existing user data. Report what is already configured (`minimal` vs. `enriched`) and what is missing.

### 2. Stage 1 — Fast Core Bootstrap (~10 Minutes)

If core files are missing, collect ONLY the minimum viable skeleton in 1–2 short conversational rounds (numbered questions, concise, easy to answer):

1. **North Star (`profile/north-star.md`)**: Top 3 core values + 1-sentence yearly theme + any non-negotiable life rules.
2. **Vitality Floor (`profile/vitality.md`)**: Minimum sleep window, baseline exercise goal, and main energy drainers to avoid.
3. **Schedule Constraints (`profile/schedule-constraints.md`)**: Fixed recurring obligations (work/school/commute), timezone, peak focus window, and realistic daily/weekend free focus hours.
4. **Top 2–3 Yearly Priorities**: The 2–3 most important outcomes for this year (mapped to domains, creating minimal stub profiles for `mastery`, `wealth`, `connection-joy`, and `world-radar` as needed).

Write each file following `templates/profile/domain-profile.md` and `templates/profile/schedule-constraints.md` with `stage: "minimal"`. Confirm the saved summary and offer to run `/strategy-review` immediately to generate the first plan hierarchy.

### 3. Stage 2 — Incremental Domain Enrichment

When the user asks to enrich a specific domain (e.g., "재정 프로필 채워줘", "world-radar 관심 분야 설정해줘", "관계 영역 업데이트"):
- Read the existing file in `profile/<domain>.md`.
- Ask 3–5 targeted questions for that single domain only:
  - `wealth`: monthly savings floor, major financial milestones, budget guardrails (no account numbers or secrets).
  - `mastery`: main career role/goals, target skills, active side projects.
  - `connection-joy`: key people/rituals, restorative hobbies, protected rest blocks.
  - `world-radar`: 3–5 specific focus topics (industry, tech, macro) to track during strategy reviews.
- Update the file in-place, preserving prior notes, and set `stage: "enriched"` and `updated_at`.

## Privacy Reminder

Remind the user on first creation that `profile/` is excluded by `.gitignore` and stays local unless they explicitly change that policy.
