# Life Planner (Antigravity Multi-Agent Core + Local Dashboard)

A local-first, multi-agent personal life planning system built on Antigravity. A lean **3-Axis Strategic Council** (`guardian`, `growth`, `world-radar`), a **reusable Subsidiary Project Manager** (`project-lead`), and a **zero-dependency local web dashboard** (`dashboard/`) automate daily & weekly rolling timetables while keeping monthly/quarterly/yearly strategy under user sign-off.

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
├── dashboard/                # Zero-dependency local web UI (reads/writes plans/ directly)
├── templates/                # Standard YAML+Markdown templates (version-controlled)
├── integrations/             # Reserved adapter boundary for external tools
├── profile/                  # [Local only] 7 personal domain & constraint profiles
├── plans/YYYY/               # [Local only] yearly, quarterly, monthly, weekly, daily plans
├── logs/                     # [Local only] Auto-archived daily completion summaries
├── council/                  # [Local only] Council opinions & mediation records
└── projects/                 # [Local only] Per-project SSOT playbooks (projects/<slug>/index.md)
```

## Daily & Weekly Rhythm

1. **Daily & Weekly (Automated — 0 Subagent Calls)**:
   - Open `dashboard/start.bat` (or `node dashboard/server.js`) to check off completed blocks (`[x]`), skipped blocks (`[-]`), ahead-of-schedule weekly tasks, and one-line exception notes.
   - Every morning at **06:00 (Asia/Seoul)** (or immediately via Catch-up if PC was off), Antigravity reads your checkmarks, notes, and Google Calendar, archives yesterday's summary to `logs/`, generates today's timetable, and rolls forward the weekly plan.
   - Lower priorities (`P2–PN`) auto-defer transparently when capacity hits 100%; `P1` core conflicts trigger a red **Approval Banner** instead of silently dropping goals.
2. **Monthly / Quarterly / Yearly Strategy (User Sign-Off)**:
   - Run `/strategy-review` to convene `guardian`, `growth`, and `world-radar` in parallel and approve a **4-Part Executive Approval Sheet** (`≤ 100%` Zero-Sum Cap).
3. **Projects & System Ops**:
   - `/project-manage` delegates any `projects/<slug>/` to `project-lead` using its local `index.md` playbook.
   - `/onboard-life`, `/system-audit`, `/sync-github` handle setup, self-audits, and privacy-safe GitHub backup.
