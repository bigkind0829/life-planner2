---
name: strategy-review
description: Strategic Planner for Yearly, Quarterly, Monthly life plans and threshold-triggered Rebalance adjustments (always user-consulted). Convenes the 3-Axis Strategic Council (guardian, growth, world-radar) in parallel, mediates conflicts via the north-star charter, enforces a 100% Zero-Sum cap, and archives council decisions.
---

# Strategy Review (Strategic Planner & Rebalance Mode)

Convene the **3-Axis Strategic Council** to create or revise Yearly, Quarterly, and Monthly plans under `plans/YYYY/` (always with user consultation and sign-off), or to run mid-period **Rebalance Mode** when tactical execution hits an escalation threshold.

## Modes

- **Mode A — Strategic Review (Yearly · Quarterly · Monthly)**: Summon all **3 council subagents** (`guardian`, `growth`, `world-radar`) in parallel.
- **Mode B — Rebalance Mode (Escalation / P1 Shortfall Resolution)**: Triggered when `needs_approval: true` (`P1` core targets cannot fit in the week), `consecutive_miss_weeks >= 2`, `floors_ok: false`, or the user explicitly requests revising Monthly/Quarterly/Yearly goals mid-period. Summon **`guardian` + `growth`** in parallel *(add `world-radar` only if an external shock triggered the rebalance)*.

## Process

### 1. Load Shared Anchor Context & Capacity Floor

Read ONLY shared anchor files (each council subagent reads its own mapped profiles):
- `profile/schedule-constraints.md` (date-bounded fixed commitments & upcoming exams/events)
- `profile/north-star.md` (charter & tie-breaking values for Main Agent mediation)
- `profile/vitality.md` (hard P0 floor summary)
- Existing active parent/target plans in `plans/YYYY/` and at most the last 2 weekly plans *(in Rebalance Mode, also read up to the last 7 auto-archived summaries in `logs/` for concrete evidence)*
- Lightweight scan of `projects/*/index.md` frontmatter + `## Milestones` (**SSOT** — never wake `project-lead` here)

If core Stage 1 profiles (`north-star`, `vitality`, `schedule-constraints`) are missing, instruct the user to run `/onboard-life` first.

Calculate realistic available capacity (**Priority-Driven Zero-Sum, ≤ 100% Hard Cap**):
- Lock **P0** first (date-bounded fixed obligations + survival sleep/health floor + ~20% daily buffer) **before** allocating `P1 → PN`.
- Condense capacity, upcoming date-bounded constraints, active project snapshot, and (for Rebalance Mode) trigger evidence into a **3-line Capacity & Portfolio Summary** to inject into every subagent prompt.

### 2. Convene the 3-Axis Council in Parallel

Invoke subagents concurrently in a single turn using `invoke_subagent`:
- **Mode A (Yearly / Quarterly / Monthly)**: `guardian`, `growth`, `world-radar`
  - For **Monthly** reviews, ask `world-radar` to scan only the **2–3 most time-sensitive topics**; for **Quarterly/Yearly**, scan all **3–5 topics** in `profile/world-radar.md`.
- **Mode B (Rebalance Mode)**: `guardian`, `growth` *(+ `world-radar` only on external shocks)*

Require every summoned subagent to return the **Uniform Council Opinion Contract**. Wait until all summoned subagents report back.

### 3. Main Agent Mediation & Approval Sheet

Act as the **impartial mediator** between `guardian` (defense/floors) and `growth` (offense/resources), grounding trade-offs in `profile/north-star.md`:

- **For Mode A (Strategic Review)**, present the **4-Part Executive Approval Sheet (결재서)**:
  1. **지난 실적 (Results)**: Concise outcomes across domains and active projects (`projects/*/index.md`).
  2. **우선순위 조정 (Priority Stack)**: Ordered stack (`P0` survival/fixed/20% buffer → `P1, P2, ..., PN` ranking all domains & projects). Present 2–3 concrete ranking scenarios if unresolved `guardian` vs. `growth` tensions remain.
  3. **다음 계획 & 신상품 3안 제안 (Next Plan & Proactive 3-Option Pitch)**: *(Skipped automatically if post-P1 capacity is `0h`, e.g., during heavy exam sprints)* Synthesize `world-radar` + `growth` signals into a **3-Option Portfolio Card** (`A: 안전·확장형`, `B: 수익·신상품형`, `C: 실험·바이럴형`) with 5 fixed fields (`핵심 목표`, `예상 기간`, `주간 투입시간`, `기대 성과`, `트레이드오프`).
  4. **시간·돈 결재 (Zero-Sum ≤ 100% Budget Cap)**: Allocate `weekly_quota_hours` and monetary budget top-down from `P0 → PN`. **Hard Rule: Total allocated time and money MUST NOT exceed 100%.** Overflow automatically scales down or defers to `0h` (`queued`/`paused`) unless a higher/peer item yields quota.

- **For Mode B (Rebalance Mode)**, present a crisp **Rebalance Mediation Brief**:
  1. **원인 진단**: Trigger evidence (`needs_approval`, `consecutive_miss_weeks`, `floors_ok`, actual vs. planned hours).
  2. **충돌 정리**: `guardian` floor warnings vs. `growth` milestone priorities, mediated via `north-star`.
  3. **조정안 2–3개 (`≤ 100%` 복구)**: Concrete options (e.g., Option A: defer lowest `PN` items to protect P0/P1; Option B: shift milestone by 1 month; Option C: time-boxed priority swap with end date). Wait for explicit user approval before modifying upstream plans.

### 4. Write Linked Plans & Archive Council Record

After user confirmation:
1. Archive the council summary, conflicts, Main Agent `north-star` mediation, and final user choice in `council/YYYY-MM-DD-strategy.md` (or `council/YYYY-MM-DD-rebalance.md`) matching `templates/council/session-record.md`.
2. Write or update the impacted plan files (`plans/YYYY/yearly.md`, `quarterly/YYYY-Q#.md`, `monthly/YYYY-MM.md`, and current `weekly/YYYY-Www.md` in Rebalance Mode) matching `templates/plans/` with valid YAML frontmatter, `needs_approval: false`, and intact `parent_id` lineage.
3. Update `status` and `weekly_quota_hours` in `projects/<slug>/index.md` for any project whose quota changed (SSOT).
4. Verify `floors_ok` accurately reflects P0 compliance.
5. Offer to refresh the current week via `/weekly-plan` (and for **Monthly** reviews, append a 1-line optional reminder: *"이번 달 `/system-audit`도 함께 돌릴까요?"*).
