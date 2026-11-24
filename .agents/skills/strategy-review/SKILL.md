---
name: strategy-review
description: Strategic Planner for Yearly, Quarterly, and Monthly life plans. Convenes all 6 MECE domain subagents in parallel, enforces reality floors, mediates conflicts using the North Star charter, archives council decisions, and writes linked YAML+Markdown plans.
---

# Strategy Review (Strategic Planner — Yearly · Quarterly · Monthly)

Convene the 6-member domain council to create or revise Yearly, Quarterly, and Monthly plans under `plans/YYYY/`.

## Process

### 1. Load Context & Capacity Floor

Read:
- `profile/schedule-constraints.md`
- `profile/north-star.md`, `profile/vitality.md`, `profile/wealth.md`, `profile/mastery.md`, `profile/connection-joy.md`, `profile/world-radar.md`
- Existing active parent/target plans in `plans/YYYY/` and recent review notes in `logs/`

If core Stage 1 profiles (`north-star`, `vitality`, `schedule-constraints`) are missing, instruct the user to run `/onboard-life` first.

Calculate realistic available goal capacity (**Constrained Top-Down**):
- Deduct fixed obligations + `vitality` sleep/exercise floor + protected `connection-joy` blocks + 20% daily buffer **before** allocating any new goals.

### 2. Convene All 6 Domain Subagents in Parallel

Invoke all 6 custom subagents concurrently in a single turn using `invoke_subagent`:
- `north-star`
- `vitality`
- `wealth`
- `mastery`
- `connection-joy`
- `world-radar` (remind it to search ONLY the 3–5 topics in `profile/world-radar.md` and return at most 3 high-signal impacts)

Pass each subagent the target planning horizon (e.g., `2026`, `2026-Q4`, `2026-11`), remaining realistic capacity, and any specific user goal or life shift. Require every subagent to return the **Uniform Domain Opinion Contract** (Current State & Floor, 1–3 Recommendations, Conflicts & Risks, 1–2 Indicators).

Wait until all 6 subagents report back.

### 3. Mediate Conflicts & Present Scenarios

1. Synthesize the 6 domain reports and list explicit cross-domain conflicts (e.g., `mastery` or `wealth` hours exceeding remaining capacity or violating `vitality` / `connection-joy` floors).
2. Apply `north-star` charter rules to draft a **1st-pass mediated recommendation**.
3. If major unresolved trade-offs remain, present **2–3 concrete scenarios** (e.g., **Option A: Recommended Balanced**, **Option B: Focused Sprint**, **Option C: Recovery/Consolidation**) showing what each gains and sacrifices, and wait for the user to choose or tweak.

### 4. Write Linked Plans & Archive Council Record

After user confirmation:
1. Archive the council summary, conflicts, mediation logic, and final user choice in `council/YYYY-MM-DD-strategy.md` using `templates/council/session-record.md`.
2. Write or update the relevant plan files matching `templates/plans/` with valid YAML frontmatter and intact `parent_id` lineage:
   - Yearly: `plans/YYYY/yearly.md` (`id: "YYYY"`, `parent_id: null`)
   - Quarterly: `plans/YYYY/quarterly/YYYY-Q#.md` (`parent_id: "YYYY"`)
   - Monthly: `plans/YYYY/monthly/YYYY-MM.md` (`parent_id: "YYYY-Q#"`)
3. Verify `floors_ok` accurately reflects whether all non-negotiable floors are preserved.
4. Offer to generate the current week's tactical plan via `/weekly-plan`.
