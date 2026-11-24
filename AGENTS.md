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

#### Hierarchical Sub-Specialist Extensibility
Each of the 6 domain agents acts as a **domain lead**. Later, any domain may add child sub-specialists under `.agents/agents/` (for example, `vitality-sleep`, `vitality-workout`, `wealth-invest`, `mastery-career`). When child specialists exist, the parent domain lead delegates to them and synthesizes their input into the **same Uniform Domain Opinion Contract** upward so the Strategic Planner interface never changes.

### Two-Tier Planner Layer (`.agents/skills/`)
- **Strategic Planner (`/strategy-review`) — Yearly / Quarterly / Monthly**:
  - Summons all 6 domain subagents **in parallel** using `invoke_subagent`.
  - Applies **Constrained Top-Down** capacity budgeting: lock fixed schedule + vitality floor + buffer first, then fit goals into remaining capacity.
  - Uses `north-star` charter rules for 1st-pass conflict mediation; presents only core unresolved trade-offs as 2–3 concrete scenarios for user choice.
  - Archives council opinions and final decisions in `council/`.
- **Tactical Planner (`/weekly-plan`, `/daily-plan`) — Weekly / Daily**:
  - Reads only the active Monthly plan, `profile/schedule-constraints.md`, `profile/vitality.md` floor, and recent logs.
  - **Does NOT summon the 6 domain subagents** so weekly/daily adjustments remain fast and lightweight.
  - Daily plans always enforce **Top 3 MITs + key time blocks + ~20% buffer**.

## 2. Routing Rules

| User Intent | Workflow to Run |
| :--- | :--- |
| First-time setup or enriching a domain profile | `/onboard-life` |
| Yearly, quarterly, or monthly planning / major life review | `/strategy-review` |
| Weekly review or next week's time-blocked plan | `/weekly-plan` |
| Morning briefing, evening 3-min check-in, mid-day reschedule | `/daily-plan` |
| Chronic slippage, floor breach, or upstream goal revision | `/rebalance` |
| Commit and push system updates to GitHub safely | `/sync-github` |

## 3. Core Behavioral Rules

1. **Constrained Top-Down**: Never schedule goals before deducting fixed obligations, sleep/health floors, and ~20% daily buffer.
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

## 4. Privacy & GitHub Sync Guardrail

- Personal data directories (`profile/`, `plans/`, `logs/`, `council/`, `.scratch/`) are excluded in `.gitignore` and MUST NEVER be staged, committed, or pushed to a remote repository unless the user explicitly overrides this policy on a verified private repo.
- Only system files (`.agents/`, `AGENTS.md`, `README.md`, `templates/`, `integrations/`, `.gitignore`, and future `dashboard/`) are eligible for `/sync-github`.
- Always verify staged files and obtain explicit confirmation before running `git push`.
