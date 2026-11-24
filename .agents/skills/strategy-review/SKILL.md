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

### 3. Mediate Conflicts & Present 4-Part Executive Approval Sheet (결재서)

Synthesize the 6 domain reports, apply `north-star` charter rules to mediate cross-domain conflicts, and present a clean **4-Part Approval Sheet** for user sign-off:

1. **지난 실적 (Results)**: Concise summary of outcomes across domains and active subsidiaries for the prior period.
2. **우선순위 조정 (Priority Stack)**: Propose the period's ordered **Priority Stack** (`P0`: survival floors, fixed obligations, 20% buffer → `P1, P2, ..., PN`: all domains & subsidiaries ranked explicitly — no hardcoded subsidiary count cap). If major strategic trade-offs remain, offer 2–3 concrete ranking scenarios.
3. **다음 계획 & 신상품 제안 (Next Plan & Proactive 3-Option Pitch)**: At Monthly, Quarterly, and Yearly reviews (except during `exam` mode, where major launches pause), synthesize `world-radar`, `mastery`, and `wealth` signals into a **3-Option Portfolio Card** (`A: 안전·확장형`, `B: 수익·신상품형`, `C: 실험·바이럴형`) with 5 fixed fields (`핵심 목표`, `예상 기간`, `주간 투입시간`, `기대 성과(수익/성장/유튜브 소재력)`, `트레이드오프`).
4. **시간·돈 결재 (Zero-Sum Hard 100% Budget Cap)**: Allocate weekly hours (`weekly_quota_hours`) and monetary budget strictly top-down from `P0 → P1 → ... → PN`. **Hard Rule: Total allocated time and money MUST NOT exceed 100% of available capacity.** The moment remaining capacity reaches 0, lower-priority items automatically scale down or defer to `0h` (`queued`) — never finalize an overbooked sheet; if the user wants to fund a lower item, explicitly confirm which higher/peer item yields hours or budget.
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
