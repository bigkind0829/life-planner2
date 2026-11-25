# Life Planner (Antigravity Multi-Agent Core)

A local-first, multi-agent personal life planning system built on Antigravity. A lean **3-Axis Strategic Council** (`guardian`, `growth`, `world-radar`) and a **reusable Subsidiary Project Manager** (`project-lead`) power a two-tier planner using Markdown + YAML files compatible with Obsidian and future local web dashboards.

See [ARCHITECTURE.md](ARCHITECTURE.md) (Mermaid) or open [ARCHITECTURE.canvas](ARCHITECTURE.canvas) in Obsidian for the full visual topology.

## Directory Layout

```text
lifeplanner/
├── AGENTS.md                 # Workspace operating charter & routing rules
├── ARCHITECTURE.md           # Visual Mermaid topology & data contracts
├── ARCHITECTURE.canvas       # Obsidian interactive architecture board
├── .gitignore                # Protects personal data directories from Git leaks
├── .agents/
│   ├── agents/               # 4 flash subagents: guardian, growth, world-radar, project-lead
│   └── skills/               # 7 skills: 4 Core Planning + 3 System Ops
├── templates/                # Standard YAML+Markdown templates (version-controlled)
├── integrations/             # Reserved adapter boundary for Phase 2 external tools
├── profile/                  # [Local only] 7 personal domain & constraint profiles
├── plans/YYYY/               # [Local only] yearly, quarterly, monthly, weekly, daily plans
├── logs/                     # [Local only] Daily check-ins & periodic reflections
├── council/                  # [Local only] Council opinions & mediation records
└── projects/                 # [Local only] Per-project SSOT playbooks (projects/<slug>/index.md)
```

## Quick Start

1. **Onboard (10 min)**: Run `/onboard-life` to initialize your core values, health floor, fixed schedule, and top yearly goals inside `profile/`.
2. **Set Strategy & Rebalance**: Run `/strategy-review` to convene the 3-Axis Council (`guardian`, `growth`, `world-radar`) in parallel and approve a **4-Part Executive Approval Sheet** (`≤ 100%` Zero-Sum Cap). Also handles mid-period **Rebalance Mode** (`guardian` + `growth`) when thresholds trip.
3. **Run Weekly, Daily & Projects**:
   - `/weekly-plan` once a week (**0 subagent calls**) for priority-ordered weekly time-blocking pulling `Next Actions` directly from active `projects/*/index.md`.
   - `/daily-plan` (**0 subagent calls**) for concrete morning timetables (+ ~20% buffer), 3-min evening check-ins, or instant mid-day rescheduling.
   - `/project-manage` to delegate any project under `projects/<slug>/` to the reusable `project-lead` agent using that project's local playbook.
4. **System Ops**:
   - `/system-audit` on demand to inspect token efficiency, workflow friction, schema/privacy integrity, and upgrade proposals.
   - `/sync-github` to safely commit and push generic system updates while guaranteeing personal data stays local.
