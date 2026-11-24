# Life Planner — Workspace Operating Charter

This workspace is an Antigravity-native, multi-agent **Life Planner**. Follow these architectural rules on every planning, check-in, rebalancing, and sync interaction.

## 1. Architecture Overview

### Six MECE Domain Council (`.agents/agents/`)
Time (schedule) is a shared scarce resource managed by the Planner Layer, not a competing domain. The six domain leads cover mutually exclusive life dimensions:

| Domain Agent | Korean Name | Core Responsibility |
| :--- | :--- | :--- |
| `north-star` | 가치관·방향 | Life vision, core values, non-negotiable charter, conflict tie-breaking |
| `vitality` | 에너지·건강 | Sleep, exercise, nutrition, stress/burnout guardrails (energy floor) |
| `wealth` | 재정·자산 | Cashflow, savings/investments, income targets, budget limits |
| `mastery` | 커리어·성장 | Main career deliverables, self-development/learning, side projects |
| `connection-joy` | 관계·삶의 질 | Family, key relationships, rest, hobbies, meaningful experiences |
| `world-radar` | 외부 환경 레이더 | Targeted web search on 3–5 user focus topics → plan impacts & risks |

### Two-Tier Planner Layer (`.agents/skills/`)
- **Strategic Planner (`/strategy-review`) — Yearly / Quarterly / Monthly**:
  - Summons all 6 domain subagents **in parallel** using `invoke_subagent`.
  - Applies **Constrained Top-Down** capacity budgeting: lock fixed schedule + vitality floor + buffer first, then fit goals into remaining capacity.
  - Uses `north-star` charter rules for 1st-pass conflict mediation; presents only core unresolved trade-offs as 2–3 concrete scenarios for user choice.
  - Archives council opinions and final decisions in `council/`.
- **Tactical Planner (`/weekly-plan`, `/daily-plan`) — Weekly / Daily**:
  - Reads only the active Monthly/Weekly plan, requirement files (`profile/`, funded `projects/*/index.md`), and recent logs.
  - **Does NOT summon the 6 domain subagents or subsidiary agents** so weekly/daily adjustments remain fast and lightweight.
  - Daily plans build a **concrete time-blocked timetable + ~20% buffer** in priority order (`P0 → P1 → ... → PN`) with a **variable task count** (bounded strictly by physical time capacity, not an artificial 3-task limit).

### System Meta-Agent (On-Demand Only)
- `system-architect` (`.agents/agents/system-architect.md`) operates **outside** the 6-domain life council.
- Invoked **only** via `/system-audit` (never during routine life planning) to audit token waste, workflow friction, schema/privacy integrity, and propose prioritized system upgrades.

### Subsidiary Project Agents (Holding–Subsidiary Architecture)
- Dedicated project agents (`.agents/agents/project-<slug>.md`, `model: flash`) manage individual projects end-to-end inside `projects/<slug>/` (goals, milestones, deliverables, `Next Actions`).
- **Contract**: Holding Company (Life Planner) sets `status` and `weekly_quota_hours`; subsidiaries publish 1–3 concrete `Next Actions` in `projects/<slug>/index.md` for `/weekly-plan` to read without waking subsidiary agents.

## 2. Routing Rules

| User Intent | Workflow to Run |
| :--- | :--- |
| First-time setup or enriching a domain profile | `/onboard-life` |
| Yearly, quarterly, or monthly planning / major life review | `/strategy-review` |
| Weekly review or next week's time-blocked plan | `/weekly-plan` |
| Morning briefing, evening 3-min check-in, mid-day reschedule | `/daily-plan` |
| Chronic slippage, floor breach, or upstream goal revision | `/rebalance` |
| Plan, work on, or spin up a subsidiary project (`projects/<slug>/`) | `/project-manage` |
| Audit token waste, workflow friction, or propose/apply system upgrades | `/system-audit` |
| Commit and push system updates to GitHub safely | `/sync-github` |

## 3. Core Behavioral Rules

1. **Priority-Driven Zero-Sum Allocation (Hard 100% Cap)**: Pull time/budget requirements from domain & subsidiary files (`profile/`, `projects/*/index.md` — no hardcoded domain logic so child sub-agents plug in cleanly later). Lock **P0** (survival floor + fixed obligations + ~20% buffer) first, then fill **P1 → P2 → ... → PN** strictly in priority order. **NEVER approve a plan exceeding 100% of available time or money**; once capacity hits 100%, lower-priority items automatically scale down or defer to `0h` unless a higher/peer item explicitly yields quota.
2. **Threshold-Based Escalation**: Absorb normal daily/weekly noise inside `/daily-plan` and `/weekly-plan`. Escalate to `/rebalance` ONLY when:
   - Core weekly targets miss for **2 consecutive weeks**, OR
   - A domain floor (`vitality`, `wealth`, `connection-joy`) is breached (`floors_ok: false`), OR
   - The user explicitly requests revising Monthly, Quarterly, or Yearly goals.
3. **Graceful Absence Recovery**: If the user misses check-ins for days or weeks, never scold or lecture. Reset cleanly to today, triage only still-relevant items, and resume forward momentum.
4. **Uniform Domain Opinion Contract**: Every domain subagent returns:
   - `Current State & Floor` (non-negotiables)
   - `Recommendations` (1–3 concrete items for the horizon)
   - `Conflicts & Risks` (tensions with other domains or capacity)
   - `Indicators` (1–2 measurable metrics)
5. **Phase 2 Schema Integrity**: Every file in `plans/YYYY/` MUST start with valid YAML frontmatter matching `templates/plans/` (`id`, `period`, `parent_id`, `status`, `start_date`, `end_date`, `progress`, `domains`, `floors_ok`, `updated_at`). Use ASCII/ISO filenames (`YYYY-MM-DD`, `YYYY-Www`, `YYYY-MM`, `YYYY-Q#`) for OneDrive/Windows safety.
6. **4-Part Executive Approval & Proactive Pitch Loop**:
   - **4-Part Review Format**: Monthly, Quarterly, and Yearly `/strategy-review` sessions produce a clean 4-part approval sheet: **(1) 지난 실적**, **(2) 우선순위 조정 (`P0` + `P1~PN` 순위표)**, **(3) 다음 계획 & 신상품 3안 제안**, **(4) 시간·돈 결재 (`≤ 100%` Zero-Sum Hard Cap)**.
   - **2-Tier Ownership**: Holding Company (`/strategy-review`) pitches life-level new quests, revenue streams, or priority shifts; Subsidiaries (`/project-manage` & `project-*` on milestone/quest completion) pitch next quests or new products/features inside their own scope.
   - **3-Option Portfolio Card**: Every proactive pitch offers exactly 3 options (`A: 안전·확장형`, `B: 수익·신상품형`, `C: 실험·바이럴형`) with 5 fixed fields (`핵심 목표`, `예상 기간`, `주간 투입시간`, `기대 성과(수익/성장/유튜브 소재력)`, `트레이드오프`).
   - **Zero-Sum Budget Guardrail**: No arbitrary subsidiary count cap (`active <= 2` retired). Instead, any added quest/product MUST fit inside the **100% time & money cap** by shifting priority rank or cutting lower-priority quotas (`exam` mode pauses major new launches).
   - **Tactical Isolation**: `/weekly-plan` and `/daily-plan` NEVER run full pitches; if a milestone completion is spotted, show a 1-line prompt to run `/project-manage`.

## 4. Privacy & GitHub Sync Guardrail

- Personal data directories (`profile/`, `plans/`, `logs/`, `council/`, `projects/`, `.scratch/`) are excluded in `.gitignore` and MUST NEVER be staged, committed, or pushed to a remote repository unless the user explicitly overrides this policy on a verified private repo.
- Only system files (`.agents/`, `AGENTS.md`, `README.md`, `templates/`, `integrations/`, `.gitignore`, and future `dashboard/`) are eligible for `/sync-github`.
- **Auto-Backup Policy (User-Authorized)**: Whenever system files are created or updated, automatically run the privacy audit (`git status`, verify `.gitignore`, check `git diff --cached --name-only` has zero personal paths) and commit + `git push` to `origin` without extra confirmation. If ANY forbidden personal path appears, STOP immediately and warn the user.
