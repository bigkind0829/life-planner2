---
name: strategy-review
description: Strategic Planner for Yearly, Quarterly, Monthly life plans, 28th auto-draft proposals, and threshold-triggered Rebalance adjustments (always user-consulted before locking upstream plans). Convenes the 3-Axis Strategic Council (guardian, growth, world-radar) in parallel, mediates conflicts via north-star, enforces a 100% Zero-Sum Time & Money cap, and proposes comprehensive mastery & wealth projects.
---

# Strategy Review (Strategic Planner & Rebalance Mode)

Convene the **3-Axis Strategic Council** to create or revise Yearly, Quarterly, and Monthly plans under `plans/YYYY/` (always with user consultation and sign-off), to draft next month's **4-Part Approval Sheet** automatically on the 28th, or to run mid-period **Rebalance Mode**.

## Modes

- **Mode A — Strategic Review (Yearly · Quarterly · Monthly)**: Summon all **3 council subagents** (`guardian`, `growth`, `world-radar`) in parallel. Present the 4-Part Approval Sheet (Time & Money `≤ 100%`) and write plans only after user sign-off.
- **Mode B — Rebalance Mode (Escalation / P1 Shortfall Resolution)**: Triggered when `needs_approval: true` (`P1` core targets cannot fit in the week), `consecutive_miss_weeks >= 2`, `floors_ok: false`, or the user requests revising upstream plans mid-period. Summon **`guardian` + `growth`** in parallel *(add `world-radar` only on external shocks)*.
- **Mode C — Monthly Auto-Draft Proposal (28th 20:00 Cron)**: Summon all **3 council subagents** in parallel and save a **Draft 4-Part Approval Sheet** to `council/YYYY-MM-DD-monthly-draft.md` *(NEVER overwrite active Monthly/Quarterly/Yearly plans without explicit user approval!)*.

## Process

### 1. Load Shared Anchor Context (Time & Money Pools)

Read ONLY shared anchor files (each council subagent reads its own mapped profiles):
- `profile/schedule-constraints.md` (date-bounded fixed time commitments & upcoming exams/events)
- `profile/wealth.md` (YAML financial snapshot: `liquid_cash_krw`, `monthly_income_krw`, `monthly_expense_krw`, `total_debt_krw`, `investable_pool_krw`)
- `profile/north-star.md` (charter & tie-breaking values for Main Agent mediation)
- `profile/vitality.md` (hard P0 floor summary)
- Existing active parent/target plans in `plans/YYYY/` and at most the last 2 weekly plans *(in Rebalance Mode, also read up to the last 7 auto-archived summaries in `logs/`)*
- Lightweight scan of `projects/*/index.md` frontmatter (`status`, `weekly_quota_hours`, `monthly_budget_krw`, `capital_pool_krw`, `target_monthly_income_krw`) + `## Milestones` (**SSOT** — never wake `project-lead` here)

If core Stage 1 profiles (`north-star`, `vitality`, `schedule-constraints`) are missing, instruct the user to run `/onboard-life` first.

Calculate realistic available **Time & Money Capacity (Priority-Driven Zero-Sum, ≤ 100% Hard Cap)**:
- Lock **P0** first across BOTH resources: fixed time obligations + survival sleep/health floor + ~20% buffer, AND essential living expenses + mandatory debt/repayment obligations.
- Condense remaining time hours, wealth snapshot (cash/surplus/investable pool), active project allocations, and (for Rebalance Mode) trigger evidence into a **4-line Time, Money & Portfolio Summary** to inject into every subagent prompt.

### 2. Convene the 3-Axis Council in Parallel

Invoke subagents concurrently in a single turn using `invoke_subagent`:
- **Mode A / Mode C**: `guardian`, `growth`, `world-radar`
  - For **Monthly** reviews, ask `world-radar` to scan only the **2–3 most time-sensitive topics**; for **Quarterly/Yearly**, scan all **3–5 topics** in `profile/world-radar.md`.
- **Mode B (Rebalance Mode)**: `guardian`, `growth` *(+ `world-radar` only on external shocks)*

Require every summoned subagent to return the **Uniform Council Opinion Contract**. Wait until all summoned subagents report back.

### 3. Main Agent Mediation & 4-Part Executive Approval Sheet (결재서)

Act as the **impartial mediator** between `guardian` (defense/floors) and `growth` (mastery + wealth/capital offense), grounding trade-offs in `profile/north-star.md`:

- **For Mode A & Mode C**, produce the **4-Part Executive Approval Sheet (결재서)**:
  1. **지난 실적 (Time & Wealth Results)**: Concise outcomes across domains, active projects, and cashflow/asset progress.
  2. **우선순위 조정 (Priority Stack)**: Ordered stack (`P0` survival/fixed/living floor → `P1, P2, ..., PN` ranking all mastery & wealth projects). Present 2–3 concrete scenarios if unresolved `guardian` vs. `growth` tensions remain.
  3. **다음 계획 & 종합 프로젝트 3안 제안 (Mastery + Wealth/Capital 3-Option Pitch)**: Synthesize `world-radar` + `growth` signals into a **3-Option Portfolio Card** covering BOTH time-based growth AND wealth/capital projects (savings/debt plans, active income, investing, automated trading, startups, bankroll/side strategies as appropriate):
     - `A: 안정·확정 현금흐름/저축형`
     - `B: 자본 증식·시스템형` *(투자·자동매매·수익 상품 등)*
     - `C: 비대칭·고수익 실험형` *(스타트업·고변동성 실험·바이럴 퀘스트 등)*
     - Fixed fields: `핵심 목표`, `예상 기간`, `주간 투입시간`, `투입 예산/자본금`, `기대 성과(수익/자산/성장)`, `트레이드오프`
  4. **시간·돈 결재 (Symmetric Zero-Sum ≤ 100% Cap)**: Allocate BOTH `weekly_quota_hours` AND `monthly_budget_krw` / `capital_pool_krw` / `target_monthly_income_krw` top-down from `P0 → PN`. **Hard Rule: Total allocated Time AND Money MUST NOT exceed 100% of available capacity.** Overflow automatically scales down or defers to `0h` / `0원` (`queued`/`paused`) unless a higher/peer item yields quota.

- **For Mode B (Rebalance Mode)**, present a crisp **Rebalance Mediation Brief**:
  1. **원인 진단**: Trigger evidence (`needs_approval`, `consecutive_miss_weeks`, `floors_ok`, actual vs. planned hours/budget).
  2. **충돌 정리**: `guardian` floor warnings vs. `growth` mastery/wealth priorities, mediated via `north-star`.
  3. **조정안 2–3개 (`≤ 100%` 복구)**: Concrete options across time and/or budget. Wait for explicit user approval before modifying upstream plans.

### 4. Save Draft (Mode C) or Write Approved Plans (Mode A / Mode B)

- **Mode C (28th Auto-Draft)**: Save the full 4-Part Approval Sheet draft to `council/YYYY-MM-DD-monthly-draft.md` and stop (do NOT modify `plans/YYYY/monthly/` or `projects/` until the user reviews and approves it).
- **Mode A / Mode B (After User Confirmation)**:
  1. Archive the council summary, conflicts, Main Agent `north-star` mediation, and final user choice in `council/YYYY-MM-DD-strategy.md` (or `council/YYYY-MM-DD-rebalance.md`) matching `templates/council/session-record.md`.
  2. Write or update the impacted plan files (`plans/YYYY/yearly.md`, `quarterly/YYYY-Q#.md`, `monthly/YYYY-MM.md`, and current `weekly/YYYY-Www.md` in Rebalance Mode) matching `templates/plans/` with valid YAML frontmatter, `needs_approval: false`, and intact `parent_id` lineage.
  3. Update `status`, `weekly_quota_hours`, `monthly_budget_krw`, `capital_pool_krw`, and `target_monthly_income_krw` in `projects/<slug>/index.md` (or spin up newly approved wealth/growth projects via `templates/projects/project-index.md`).
  4. Verify `floors_ok` accurately reflects P0 compliance.
  5. Offer to refresh the current week via `/weekly-plan` (and for **Monthly** reviews, append a 1-line optional reminder: *"이번 달 `/system-audit`도 함께 돌릴까요?"*).
