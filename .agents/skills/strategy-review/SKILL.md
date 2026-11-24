---
name: strategy-review
description: Strategic Planner for Yearly, Quarterly, and Monthly life plans. Convenes all 6 MECE domain subagents in parallel, enforces reality floors, mediates conflicts using the North Star charter, archives council decisions, and writes linked YAML+Markdown plans.
---

# Strategy Review (Strategic Planner — Yearly · Quarterly · Monthly)

Convene the 6-member domain council to create or revise Yearly, Quarterly, and Monthly plans under `plans/YYYY/`.

## Process

### 1. Load Context & Capacity Floor

Read ONLY shared anchor files (avoid reading all 6 domain profiles upfront — each domain subagent owns reading its own profile):
- `profile/schedule-constraints.md` (check `active_mode`: `semester` / `exam` / `vacation`)
- `profile/vitality.md` (hard floor only)
- `profile/north-star.md` (charter & top values)
- Existing active parent/target plans in `plans/YYYY/` and at most the last 2 weekly plans (skip raw daily `logs/`)
- Frontmatter + `## Milestones` summary of `projects/*/index.md` *(lightweight scan only — do NOT wake subsidiary agents during `/strategy-review`)*

If core Stage 1 profiles (`north-star`, `vitality`, `schedule-constraints`) are missing, instruct the user to run `/onboard-life` first.

Calculate realistic available goal capacity (**Constrained Top-Down**):
- Deduct fixed obligations (for the active/upcoming schedule mode) + `vitality` sleep/exercise floor + protected `connection-joy` blocks + 20% daily buffer **before** allocating any new goals.
- Condense this into a **3-line Capacity & Mode Summary** to inject into every subagent prompt so subagents do not redundantly re-read shared files.

### 2. Convene All 6 Domain Subagents in Parallel

Invoke all 6 custom subagents concurrently in a single turn using `invoke_subagent`:
- `north-star`
- `vitality`
- `wealth`
- `mastery`
- `connection-joy`
- `world-radar` (for **Monthly** reviews, request a lightweight 2–3 urgent-topic scan; for **Quarterly/Yearly** reviews, scan all 3–5 topics in `profile/world-radar.md`, max 3 high-signal impacts)

Pass each subagent the target planning horizon (e.g., `2026`, `2026-Q4`, `2026-12`), the 3-line Capacity & Mode Summary, active parent plan summary, and any specific user goal or life shift. Require every subagent to return the **Uniform Domain Opinion Contract** (Current State & Floor, 1–3 Recommendations, Conflicts & Risks, 1–2 Indicators).

Wait until all 6 subagents report back.

### 3. Mediate Conflicts & Present Scenarios

1. Synthesize the 6 domain reports and list explicit cross-domain conflicts (e.g., `mastery` or `wealth` hours exceeding remaining capacity or violating `vitality` / `connection-joy` floors).
2. Apply `north-star` charter rules to draft a **1st-pass mediated recommendation**.
3. If major unresolved trade-offs remain, present **2–3 concrete scenarios** (e.g., **Option A: Recommended Balanced**, **Option B: Focused Sprint**, **Option C: Recovery/Consolidation**) showing what each gains and sacrifices, and wait for the user to choose or tweak.
4. **Proactive Next Quest & New Product Pitch (Holding-Company Tier)**: At the end of Monthly, Quarterly, and Yearly reviews (except during `exam` mode, where major launches pause), synthesize `world-radar`, `mastery`, and `wealth` signals into a **3-Option Portfolio Card** (`A: 안전·확장형`, `B: 수익·신상품형`, `C: 실험·바이럴형`) for life-level new quests, revenue streams, or portfolio shifts.
   - Each card MUST include 5 fixed fields: `핵심 목표`, `예상 기간`, `주간 투입시간`, `기대 성과(수익/성장/유튜브 소재력)`, `트레이드오프`.
   - Enforce **Strict 1-In, 1-Out**: if adopting an option pushes `active` projects past 2 or exceeds capacity, explicitly specify which existing project finishes, scales down, or moves to `queued`.
   - When the user approves a new quest/product, offer to log it as a content candidate in `projects/youtube/index.md` (`## Ideas & Backlog`) if relevant, and park unchosen good ideas in the relevant project's backlog.

### 4. Write Linked Plans & Archive Council Record

After user confirmation:
1. Archive the council summary, conflicts, mediation logic, and final user choice in `council/YYYY-MM-DD-strategy.md` using `templates/council/session-record.md`.
2. Write or update the relevant plan files matching `templates/plans/` with valid YAML frontmatter and intact `parent_id` lineage:
   - Yearly: `plans/YYYY/yearly.md` (`id: "YYYY"`, `parent_id: null`)
   - Quarterly: `plans/YYYY/quarterly/YYYY-Q#.md` (`parent_id: "YYYY"`)
   - Monthly: `plans/YYYY/monthly/YYYY-MM.md` (`parent_id: "YYYY-Q#"`)
3. Verify `floors_ok` accurately reflects whether all non-negotiable floors are preserved.
4. Offer to generate the current week's tactical plan via `/weekly-plan`.
5. For **Monthly** reviews, append a 1-line optional reminder: *"이번 달 `/system-audit`도 함께 돌릴까요?"* (never auto-invoke).
