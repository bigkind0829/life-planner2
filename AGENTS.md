# Life Planner — Operating Charter

Antigravity-native **4-Agent / 7-Skill + Local Dashboard (`dashboard/`)** Life Planner. Visual topology: [ARCHITECTURE.md](ARCHITECTURE.md), [ARCHITECTURE.canvas](ARCHITECTURE.canvas).

## 1. Architecture (Dual-Resource Holding Company)

**Time** (`profile/schedule-constraints.md` + `gcalendar`) and **Money/Capital** (`profile/wealth.md`) are two symmetric `≤ 100%` Zero-Sum resource pools allocated across P0 floors, plans, and projects (`projects/*/index.md`).

### Subagents (`.agents/agents/`, all `model: flash`)
| Agent | Role | Owned Inputs |
| :--- | :--- | :--- |
| `guardian` | **Defense & Floors**: Values, health/sleep, relationships/rest (P0 veto warnings) | `profile/north-star.md`, `vitality.md`, `connection-joy.md` |
| `growth` | **Offense & Dual-Resource Portfolio**: Career/study mastery, wealth/capital (income, savings, investing, trading, startups), project ranking | `profile/mastery.md`, `wealth.md` + `projects/*/index.md` summary |
| `world-radar` | **External Signal**: Targeted `search_web` on 3–5 topics → plan-impacting opportunities/risks | `profile/world-radar.md` + `search_web` |
| `project-lead` | **Reusable Subsidiary Manager**: Playbook-driven execution for any single growth or wealth project | Assigned `projects/<slug>/` only (`index.md` SSOT) |

- **Mediation**: `guardian` warns on P0 floors; `growth` pushes outcomes. **Main Agent mediates** via `profile/north-star.md` and presents unresolved trade-offs as 2–3 scenarios for user approval.
- **Zero Wrapper Overhead**: Tactical planning, onboarding, audits, and GitHub sync run directly in the Main Agent (**0 subagent calls**).

### Skills & Routing (`.agents/skills/`)
| Group | Skill | Trigger / Responsibility | Calls |
| :--- | :--- | :--- | :---: |
| **Core** | `/strategy-review` | Yearly (Annual), Quarterly (QBR ROI/Kill), Monthly (MBR Plan-vs-Actual/KPT), 28th 20:00 auto-draft (`council/` only), and **Rebalance Mode** | 3 (Rebalance: 2) |
| **Core** | `/weekly-plan` | Sun 20:30 auto-draft + daily rolling sync; reads active Monthly plan, `Next Actions` of funded `projects/*/index.md`, `gcalendar` | 0 |
| **Core** | `/daily-plan` | 06:00 auto-replan (or catch-up) & mid-day exceptions; ingests dashboard checkmarks `[x]`/`[-]`, check-ahead weekly `[x]`, `Quick Notes`, `gcalendar` → archives `logs/`, writes daily + rolls weekly | 0 |
| **Core** | `/project-manage` | Plan/execute deliverables or spin up any growth/wealth project under `projects/<slug>/` | 1 (`project-lead`) |
| **Ops** | `/onboard-life` | Stage 1/2 setup & enrichment of `profile/` (7 files) | 0 |
| **Ops** | `/system-audit` | On-demand audit of token weight, SSOT, schema/privacy, and `ARCHITECTURE.*` sync (never auto-run) | 0 |
| **Ops** | `/sync-github` | Privacy-safe commit & push of system files only | 0 |

## 2. Core Operating Rules

1. **Symmetric Zero-Sum Cap (`≤ 100%`) & No Global Mode Switches**: Lock **P0** (date-bounded fixed commitments + survival/dignity floors + ~20% buffer + essential living/debt) first, then allocate `P1 → PN` strictly within `100%` Time & Money. Never use global switches like `exam` mode — use date-bounded fixed schedules and `weekly_quota_hours: 0` (`queued`/`paused`).
2. **Auto-Deferral vs. P1 Approval Boundary**:
   - Overflow on **`P2–PN`**: auto-defer bottom-up to stay `≤ 100%` and log 2–3 transparent lines in `## Auto-Adjustment Log`.
   - Shortfall on **`P1` (`[핵심]`)**: **NEVER silently drop `P1`**. Schedule the safest `P0 + P1` subset, set `needs_approval: true`, and surface an approval banner asking what to defer/drop.
3. **Escalation Thresholds → `/strategy-review` (Rebalance Mode)**: Escalate ONLY when `needs_approval: true`, `consecutive_miss_weeks >= 2`, `floors_ok: false`, or the user requests changing Monthly/Quarterly/Yearly goals.
4. **Read-Only School Calendar**: Never delete/modify external school calendars. Hide routine lectures by default (show personal events + exams/assessments only); read lectures read-only only when preparing exam study plans.
5. **Graceful Absence Recovery**: Never scold missed days/checkmarks; reset cleanly to today and triage only still-relevant items.
6. **Uniform Council Contract**: Every council subagent returns 4 sections: `Current State & Floor/Watchlist`, `Recommendations (1–3)`, `Conflicts & Risks/Floor Warnings`, `Indicators (1–2)`.
7. **4-Part Approval Sheet & 3-Option Pitch**: Strategic reviews present **(1) 지난 실적**, **(2) 우선순위 조정 (`P0`+`P1~PN`)**, **(3) 다음 계획 & 종합 3안 제안**, **(4) 시간·돈 결재 (`≤ 100%`)**. Proactive pitches use 3 options (`A: 안정·현금흐름`, `B: 자본증식·시스템`, `C: 비대칭·실험`) fitting `≤ 100%` (tactical skills never pitch — only 1-line `/project-manage` notice).
8. **SSOT & Schema Integrity**:
   - `projects/<slug>/index.md`: sole SSOT for `status`, `weekly_quota_hours`, `monthly_budget_krw`, `capital_pool_krw`, `target_monthly_income_krw`, `## Operating Rules & Constraints`, milestones, and `## Next Actions`.
   - `profile/wealth.md`: sole SSOT for YAML financial snapshot + `## Monthly Snapshot History`.
   - `plans/YYYY/daily/` & `weekly/`: sole SSOT shared directly by Antigravity, `dashboard/`, and Obsidian (valid YAML frontmatter + ISO filenames).
   - Keep [ARCHITECTURE.md](ARCHITECTURE.md) and [ARCHITECTURE.canvas](ARCHITECTURE.canvas) synced whenever `.agents/` or `dashboard/` changes.

## 3. Privacy & GitHub Auto-Backup Guardrail

- **Never stage, commit, or push** `profile/`, `plans/`, `logs/`, `council/`, `projects/`, `.scratch/`, `.env`, or personal details hardcoded inside system files.
- **Eligible system files only**: `.agents/`, `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `ARCHITECTURE.canvas`, `templates/`, `integrations/`, `dashboard/`, `.gitignore`.
- **Auto-Backup Policy (User-Authorized)**: Whenever system files change, run privacy audit (`git status`, verify `.gitignore` & `git diff --cached --name-only` contain zero forbidden paths), then commit and `git push` to `origin` automatically. If ANY personal path appears, STOP immediately and warn the user.
