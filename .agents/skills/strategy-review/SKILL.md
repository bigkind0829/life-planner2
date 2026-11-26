---
name: strategy-review
description: Strategic Planner for Yearly, Quarterly, Monthly life plans, 28th auto-draft proposals, and threshold-triggered Rebalance adjustments (always user-consulted before locking upstream plans). Convenes the 3-Axis Strategic Council (guardian, growth, world-radar) in parallel, runs horizon-specific MBR/QBR/Annual modules, mediates conflicts via north-star, and enforces a 100% Zero-Sum Time & Money cap.
---

# Strategy Review (Strategic Planner & Rebalance Mode)

Convene the **3-Axis Strategic Council** to run differentiated **Monthly (MBR)**, **Quarterly (QBR)**, or **Yearly (Annual)** reviews under `plans/YYYY/` (always with user consultation and sign-off), draft next month's proposal on the 28th, or run mid-period **Rebalance Mode**.

## Modes

- **Mode A — Strategic Review (Monthly · Quarterly · Yearly)**: Summon all **3 council subagents** (`guardian`, `growth`, `world-radar`) in parallel, run the matching **Horizon-Specific Module** below, present the 4-Part Approval Sheet (`≤ 100%` Time & Money), and write plans only after user sign-off.
- **Mode B — Rebalance Mode (Escalation / P1 Shortfall Resolution)**: Triggered when `needs_approval: true`, `consecutive_miss_weeks >= 2`, `floors_ok: false`, or the user requests revising upstream plans mid-period. Summon **`guardian` + `growth`** in parallel *(add `world-radar` only on external shocks)*.
- **Mode C — Monthly Auto-Draft Proposal (28th 20:00 Cron)**: Summon all **3 council subagents** in parallel with the **Monthly (MBR)** module and save a draft to `council/YYYY-MM-DD-monthly-draft.md` *(NEVER overwrite active Monthly/Quarterly/Yearly plans without explicit user approval!)*.

## Process

### 1. Load Shared Anchor Context (Time & Money Pools)

Read ONLY shared anchor files (each council subagent reads its own mapped profiles):
- `profile/schedule-constraints.md` (date-bounded fixed time commitments & upcoming exams/events)
- `profile/wealth.md` (YAML financial snapshot + `## Monthly Snapshot History` time-series)
- `profile/north-star.md` (charter & tie-breaking values for Main Agent mediation)
- `profile/vitality.md` (hard P0 floor summary)
- Existing active parent/target plans in `plans/YYYY/` and at most the last 2 weekly plans *(in Rebalance Mode, also read up to the last 7 auto-archived summaries in `logs/`)*
- Lightweight scan of `projects/*/index.md` frontmatter (`status`, `weekly_quota_hours`, `monthly_budget_krw`, `capital_pool_krw`, `target_monthly_income_krw`) + `## Milestones` (**SSOT** — never wake `project-lead` here)

If core Stage 1 profiles (`north-star`, `vitality`, `schedule-constraints`) are missing, instruct the user to run `/onboard-life` first.

Calculate realistic available **Time & Money Capacity (Priority-Driven Zero-Sum, ≤ 100% Hard Cap)**:
- Lock **P0** first across BOTH resources: fixed time obligations + survival sleep/health floor + ~20% buffer, AND essential living expenses + mandatory debt/repayment obligations.
- Condense remaining time hours, wealth snapshot + trend, active project allocations, and (for Rebalance Mode) trigger evidence into a **4-line Time, Money & Portfolio Summary** to inject into every subagent prompt.

### 2. Convene the 3-Axis Council in Parallel

Invoke subagents concurrently in a single turn using `invoke_subagent`:
- **Mode A / Mode C**: `guardian`, `growth`, `world-radar`
  - **Monthly (MBR)**: ask `world-radar` for only the **2–3 most time-sensitive topics**.
  - **Quarterly (QBR) / Yearly (Annual)**: ask `world-radar` for all **3–5 topics** in `profile/world-radar.md`.
- **Mode B (Rebalance Mode)**: `guardian`, `growth` *(+ `world-radar` only on external shocks)*

Require every summoned subagent to return the **Uniform Council Opinion Contract**. Wait until all summoned subagents report back.

### 3. Horizon-Specific Corporate Review Modules + 4-Part Approval Sheet

Act as the **impartial mediator** between `guardian` (defense/floors) and `growth` (mastery + wealth/capital offense) using `profile/north-star.md`. Adapt the **4-Part Executive Approval Sheet** to the exact horizon:

#### Horizon A — Monthly Business Review (MBR · 운영 & 현금흐름)
- **Part 1 (실적 · Plan vs Actual · KPT)**: Compare planned vs. actual execution across key tasks, hours, and cashflow (`monthly_income` vs. `monthly_expense`), plus a crisp 3-line **KPT** (`Keep` / `Problem` / `Try`).
- **Part 2 (우선순위 조정)**: Adjust `P0 → PN` stack for next month.
- **Part 3 (다음 계획 & 종합 프로젝트 3안 제안)**: Synthesize `growth` + `world-radar` into a **3-Option Portfolio Card** covering mastery + wealth/capital projects (`A: 안정·확정 현금흐름/저축형`, `B: 자본 증식·시스템형`, `C: 비대칭·고수익 실험형`) with 6 fields (`핵심 목표`, `예상 기간`, `주간 투입시간`, `투입 예산/자본금`, `기대 성과`, `트레이드오프`).
- **Part 4 (시간·돈 결재 ≤ 100%)**: Lock next month's `weekly_quota_hours`, `monthly_budget_krw`, `capital_pool_krw`, and `target_monthly_income_krw`.

#### Horizon B — Quarterly Business Review (QBR · ROI & Kill / Double-Down)
Includes everything in the 4-Part Approval Sheet PLUS 3 mandatory QBR gates:
1. **OKR 정량 채점 (`0.0–1.0`) & 실패 원인 분류**: Score prior quarter's core outcomes numerically and tag any `< 0.7` miss as `실행 부족` / `목표 과다` / `방향 오류`.
2. **프로젝트 ROI 랭킹 & 강제 Kill / Double-Down 심의**: Rank all projects (`projects/*/index.md`) by return per hour & capital invested. Explicitly recommend **1–2 winners to Double-Down on** and **stalled/low-ROI projects to Pause or Kill** (preventing zombie projects).
3. **분기 순자산·부채 추이 점검**: Compare start-of-quarter vs. end-of-quarter `liquid_cash`, `investable_pool`, and `total_debt` from `profile/wealth.md`'s `## Monthly Snapshot History`.

#### Horizon C — Annual Review (연간 결산 · 정체성 · Stop-Doing)
Includes everything in the 4-Part Approval Sheet PLUS 4 mandatory Annual gates:
1. **연간 재무 결산 (Annual P&L & Balance Sheet)**: Summarize 12-month cashflow trend, debt reduction, savings/capital growth, and net-worth delta from `profile/wealth.md`'s `## Monthly Snapshot History`.
2. **Stop-Doing List (공식 폐기 목록)**: BEFORE adding next year's goals, explicitly list low-ROI habits, recurring drains, or retired projects to formally drop.
3. **핵심 복리 역량·자산 감사 (Core Competency Audit)**: Inventory durable compounding assets built this year (skills, credentials, content/audience, systems, network, recurring cashflow engines).
4. **North Star 근본 리프레시**: Re-examine `profile/north-star.md` top values, yearly theme, and non-negotiables with the user to confirm whether core direction itself evolved.

#### Mode B — Rebalance Mediation Brief (Mid-Period Escalation)
1. **원인 진단**: Trigger evidence (`needs_approval`, `consecutive_miss_weeks`, `floors_ok`, actual vs. planned hours/budget).
2. **충돌 정리**: `guardian` floor warnings vs. `growth` mastery/wealth priorities mediated via `north-star`.
3. **조정안 2–3개 (`≤ 100%` 복구)**: Concrete options across time and/or budget. Wait for explicit user approval before modifying upstream plans.

### 4. Save Draft (Mode C) or Write Approved Plans (Mode A / Mode B)

- **Mode C (28th Auto-Draft)**: Save the full Monthly (MBR) 4-Part Approval Sheet draft to `council/YYYY-MM-DD-monthly-draft.md` and stop (do NOT modify `plans/YYYY/monthly/` or `projects/` until user approval).
- **Mode A / Mode B (After User Confirmation)**:
  1. Archive the council summary, conflicts, Main Agent `north-star` mediation, and final user choice in `council/YYYY-MM-DD-strategy.md` (or `council/YYYY-MM-DD-rebalance.md`) matching `templates/council/session-record.md`.
  2. Write or update the impacted plan files (`plans/YYYY/yearly.md`, `quarterly/YYYY-Q#.md`, `monthly/YYYY-MM.md`, and current `weekly/YYYY-Www.md` in Rebalance Mode) matching `templates/plans/` with valid YAML frontmatter, `needs_approval: false`, and intact `parent_id` lineage.
  3. **Monthly Time-Series Log**: On every **Monthly** sign-off, upsert the current `YYYY-MM` row in `profile/wealth.md` under `## Monthly Snapshot History` so Quarterly and Yearly wealth trend reports stay automatic.
  4. Update `status`, `weekly_quota_hours`, `monthly_budget_krw`, `capital_pool_krw`, and `target_monthly_income_krw` in `projects/<slug>/index.md` (or spin up newly approved growth/wealth projects via `templates/projects/project-index.md`).
  5. On **Annual** sign-off, update `profile/north-star.md` if values/theme changed.
  6. Offer to refresh the current week via `/weekly-plan` (and for **Monthly** reviews, append a 1-line optional reminder: *"이번 달 `/system-audit`도 함께 돌릴까요?"*).
