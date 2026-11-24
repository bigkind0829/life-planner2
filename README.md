# Life Planner (Antigravity Multi-Agent Core)

A local-first, multi-agent personal life planning system built on Antigravity. Six MECE domain subagents advise a two-tier planner (Strategic: Yearly/Quarterly/Monthly + Tactical: Weekly/Daily) using Markdown + YAML files compatible with a future Phase 2 local web dashboard.

## Directory Layout

```text
lifeplanner/
├── AGENTS.md                 # Workspace operating charter & routing rules
├── .gitignore                # Protects personal data directories from Git leaks
├── .agents/
│   ├── agents/               # 6 MECE domain council + subsidiary project-* agents + system-architect
│   └── skills/               # 8 planner, project-manage, system-audit & sync workflow skills
├── templates/                # Standard YAML+Markdown templates (version-controlled)
├── integrations/             # Reserved adapter boundary for Phase 2 external tools
├── profile/                  # [Local only] Personal domain profiles & schedule constraints
├── plans/YYYY/               # [Local only] yearly, quarterly, monthly, weekly, daily plans
├── logs/                     # [Local only] Daily check-ins & periodic reflections
├── council/                  # [Local only] Council opinions & conflict mediation records
└── projects/                 # [Local only] Per-project workspaces (projects/<slug>/index.md)
```

## Quick Start

1. **Onboard (10 min)**: Run `/onboard-life` to capture your core values, sleep/health floor, fixed schedule, and top 2–3 yearly goals.
2. **Set Strategy**: Run `/strategy-review` to convene all 6 domain agents in parallel and generate 4-Part Approval Sheets (Results → Priority Stack → Next Plan & 3-Option Pitch → Zero-Sum `≤ 100%` Time & Money Budget) across Yearly → Quarterly → Monthly plans.
3. **Run Weekly, Daily & Subsidiaries**:
   - `/weekly-plan` once a week for priority-ordered weekly time-blocking (`≤ 100%`).
   - `/daily-plan` for concrete morning time-blocked timetables (variable task count + ~20% buffer), 3-min evening check-ins, or instant mid-day rescheduling.
   - `/project-manage` to work with dedicated subsidiary project agents (`projects/<slug>/`) and pitch next quests/products on milestone completion.
4. **Rebalance on Thresholds**: Run `/rebalance` when goals slip 2 weeks in a row, a health/finance/relationship floor is breached, or priorities shift.
5. **Audit & Upgrade System**: Run `/system-audit` anytime to inspect token waste, workflow friction, schema/privacy integrity, and prioritized upgrade ideas.
6. **Push System Updates**: Run `/sync-github` to safely commit and push system changes (`.agents/`, `AGENTS.md`, `templates/`) while guaranteeing personal data stays local.

## Extensibility

- **Hierarchical Sub-Specialists**: Each of the 6 domain agents acts as a domain lead. Future child specialists (e.g., `vitality-sleep`, `wealth-invest`, `mastery-career`) can be added under `.agents/agents/<domain>-<specialty>.md`; parent leads delegate to them and synthesize upward into the same Uniform Domain Opinion Contract without changing planner skills.
