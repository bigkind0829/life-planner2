# Life Planner — Workspace Operating Charter

This workspace is an Antigravity-native, multi-agent **Life Planner** designed around a lean **4-Agent / 7-Skill + Local Dashboard** architecture with strict privacy boundaries. Follow these rules on every planning, project, audit, and sync interaction.

## 1. Architecture Overview

Visual references: [ARCHITECTURE.md](ARCHITECTURE.md) (Mermaid) and [ARCHITECTURE.canvas](ARCHITECTURE.canvas) (Obsidian). Local check-off UI: `dashboard/`.

### Four Specialized Subagents (`.agents/agents/`, all `model: flash`)
Time (schedule) is a shared scarce resource managed by the Main Agent (Planner Layer), not a competing subagent.

| Layer | Subagent | Role & Owned Scope | Local Inputs |
| :--- | :--- | :--- | :--- |
| **Strategic Council (3-Axis)** | `guardian` | **Defense & Floors**: Values, health/sleep/burnout floor, relationships & rest (issues P0 floor vetoes) | `profile/north-star.md`, `vitality.md`, `connection-joy.md` |
| **Strategic Council (3-Axis)** | `growth` | **Offense & Resources**: Career/study mastery, wealth/budget limits, project portfolio ranking | `profile/mastery.md`, `wealth.md` + `projects/*/index.md` summary |
| **Strategic Council (3-Axis)** | `world-radar` | **External Signal**: Targeted web search on 3–5 focus topics → plan-relevant opportunities & risks | `profile/world-radar.md` + `search_web` |
| **Subsidiary Executor (1)** | `project-lead` | **Reusable Project Manager**: Playbook-driven execution for any single `projects/<slug>/` | Target `projects/<slug>/` only (`index.md` SSOT) |

- **Fair Mediation Rule**: `guardian` defends P0 floors and flags violations, while `growth` pushes high-leverage outcomes. **The Main Agent mediates conflicts between them** using `profile/north-star.md` charter rules and presents unresolved trade-offs as 2–3 concrete scenarios for user approval.
- **No Wrapper Agents**: Tactical planning (`/weekly-plan`, `/daily-plan`), system audits (`/system-audit`), onboarding (`/onboard-life`), and GitHub sync (`/sync-github`) run directly in the Main Agent without unnecessary wrapper subagents.

### Seven Skills in Two Clear Groups (`.agents/skills/`)

**Core Planning Loop (4 Skills)**
- **`/strategy-review`** *(Strategic + Rebalance — User Consultation Required)*: Yearly / Quarterly / Monthly reviews summon `guardian`, `growth`, and `world-radar` in parallel (`invoke_subagent`) to produce a **4-Part Executive Approval Sheet** (`≤ 100%` Zero-Sum Cap) and archive decisions in `council/`. Also handles **Rebalance Mode** (threshold escalation or `P1` conflict resolution) by summoning `guardian` + `growth` in parallel.
- **`/weekly-plan`** *(Tactical — Auto-Generated, 0 Subagent Calls)*: Auto-drafts next week every Sunday 20:30 and rolls forward daily at 06:00 as tasks complete early or carry over. Reads only active Monthly plan, `profile/schedule-constraints.md`, `profile/vitality.md`, active `projects/*/index.md` (`Next Actions` & `Milestones`), Google Calendar (personal + exams only), and recent `logs/`.
- **`/daily-plan`** *(Tactical — Auto-Generated at 06:00, 0 Subagent Calls)*: Automatically reads yesterday's dashboard checkmarks (`[x]`/`[-]`), ahead-of-schedule weekly checkmarks, exception notes (`## Quick Notes / Ad-Hoc Changes`), and Google Calendar to archive `logs/YYYY-MM-DD-checkin.md`, build today's timetable (`≤ 100%` + ~20% buffer), and roll forward the active weekly plan. No mandatory evening check-in conversation — user only chats/writes notes for ad-hoc exceptions or mid-day reschedules.
- **`/project-manage`** *(Holding–Subsidiary)*: Invokes `project-lead` with a target `projects/<slug>/index.md` playbook. Holding Company sets `status` & `weekly_quota_hours`; `project-lead` publishes 1–3 concrete `Next Actions` back into `projects/<slug>/index.md` (**Single Source of Truth**).

**System Ops (3 Skills)**
- **`/onboard-life`**: Two-stage progressive setup/enrichment of the 7 files in `profile/`.
- **`/system-audit`**: On-demand self-audit by the Main Agent (token efficiency, workflow friction, schema/privacy integrity, architecture doc sync, prioritized upgrades). Never auto-invoked during routine planning.
- **`/sync-github`**: Privacy-safe Git audit, commit, and push of system files only.

## 2. Routing Rules

| User Intent | Skill to Run |
| :--- | :--- |
| Yearly/quarterly/monthly planning, major life review, `P1` shortfall approval, chronic slippage, or floor breach | `/strategy-review` *(Full or Rebalance Mode)* |
| Weekly review, next week's plan, or manual weekly rolling refresh | `/weekly-plan` |
| Catch-up morning timetable, mid-day reschedule, or ad-hoc schedule exception | `/daily-plan` |
| Plan, work on, or spin up a subsidiary project (`projects/<slug>/`) | `/project-manage` |
| First-time setup or enriching a domain file in `profile/` | `/onboard-life` |
| Audit token waste, workflow friction, or propose/apply system upgrades | `/system-audit` |
| Commit and push system updates to GitHub safely | `/sync-github` |

## 3. Core Behavioral Rules

1. **Priority-Driven Zero-Sum Allocation (Hard 100% Cap — No Global Mode Switches)**:
   - Lock **P0** (date-bounded fixed obligations + survival/dignity floors + ~20% buffer) first, then allocate **P1 → P2 → ... → PN** strictly in priority order within **100% of available time and money**.
   - Do **NOT** maintain separate global switches like `exam` mode — high-intensity sprints or pauses are controlled uniformly through date-bounded fixed commitments in `profile/schedule-constraints.md` and `weekly_quota_hours: 0` (`queued`/`paused`) approved in `/strategy-review`.
2. **Auto-Deferral vs. P1 Approval Boundary (Autonomous Daily/Weekly Replanning)**:
   - When carry-overs exceed 100% capacity during daily/weekly auto-replanning:
     - **`P2–PN` (Lower Priorities)**: Automatically defer bottom-up to stay `≤ 100%`, and record a concise 2–3 line summary in `## Auto-Adjustment Log`.
     - **`P1` (`[핵심]` Core Targets)**: **NEVER silently drop or abandon `P1`.** Build the safest `P0 + P1` schedule possible, set `needs_approval: true` in YAML frontmatter, and surface a clear approval banner in `## Auto-Adjustment Log` asking the user what to defer or drop.
3. **Threshold-Based Escalation**: Absorb normal daily/weekly noise inside `/daily-plan` and `/weekly-plan`. Escalate to `/strategy-review` (**Rebalance Mode**) ONLY when:
   - `P1` core targets physically cannot fit within the week (`needs_approval: true`), OR
   - Core weekly targets miss for **2 consecutive weeks** (`consecutive_miss_weeks >= 2`), OR
   - A P0 floor is breached (`floors_ok: false`), OR
   - The user explicitly requests revising Monthly, Quarterly, or Yearly goals.
4. **Calendar Layer Preservation (Read-Only School Calendar)**: Never delete events from external/school calendars. Hide routine lectures from daily/weekly timetables by default (showing personal events + exams/assessments only), and read lecture schedules read-only only when preparing exam study plans or toggling reference view.
5. **Graceful Absence Recovery**: If the user skips checking boxes for days or weeks, never scold or lecture. Reset cleanly to today, triage only still-relevant items, and resume forward momentum.
6. **Uniform Council Opinion Contract**: Every strategic council subagent (`guardian`, `growth`, `world-radar`) returns:
   - `Current State & Floor / Watchlist`
   - `Recommendations (1–3)`
   - `Conflicts & Risks / Floor Warnings`
   - `Indicators (1–2)`
7. **Single Source of Truth (SSOT) & Schema Integrity**:
   - `projects/<slug>/index.md` is the **sole SSOT** for project status, `weekly_quota_hours`, operating rules (`## Operating Rules & Constraints`), milestones, and `## Next Actions`.
   - `plans/YYYY/daily/YYYY-MM-DD.md` and `plans/YYYY/weekly/YYYY-Www.md` are the **sole SSOT** shared directly by Antigravity, `dashboard/`, and Obsidian (no duplicate database).
   - Every file in `plans/YYYY/` MUST start with valid YAML frontmatter matching `templates/plans/` and use ASCII/ISO filenames (`YYYY-MM-DD`, `YYYY-Www`, `YYYY-MM`, `YYYY-Q#`).
8. **4-Part Executive Approval & Proactive 3-Option Pitch**:
   - Strategic `/strategy-review` produces a 4-Part Approval Sheet: **(1) 지난 실적**, **(2) 우선순위 조정 (`P0` + `P1~PN`)**, **(3) 다음 계획 & 신상품 3안 제안**, **(4) 시간·돈 결재 (`≤ 100%` Zero-Sum)**.
   - Every proactive pitch uses a **3-Option Portfolio Card** (`A: 안전·확장형`, `B: 수익·신상품형`, `C: 실험·바이럴형`) with 5 fixed fields (`핵심 목표`, `예상 기간`, `주간 투입시간`, `기대 성과`, `트레이드오프`) strictly fitting the `≤ 100%` cap (skip new launches whenever remaining post-P1 capacity is `0h`).
   - Tactical Isolation: `/weekly-plan` and `/daily-plan` NEVER run full pitches; if a milestone completion is spotted, show a 1-line prompt to run `/project-manage`.
9. **Architecture Visual Sync**: Whenever `.agents/` agents, skills, or major system components (`dashboard/`) are added, removed, or re-wired, update [ARCHITECTURE.md](ARCHITECTURE.md) and [ARCHITECTURE.canvas](ARCHITECTURE.canvas) in the same change.

## 4. Privacy & GitHub Sync Guardrail

- Personal data directories (`profile/`, `plans/`, `logs/`, `council/`, `projects/`, `.scratch/`) are excluded in `.gitignore` and MUST NEVER be staged, committed, or pushed to a remote repository unless the user explicitly overrides this policy on a verified private repo.
- System files MUST remain 100% generic (never hardcode personal project names or private details inside `.agents/` or `dashboard/`).
- Only system files (`.agents/`, `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `ARCHITECTURE.canvas`, `templates/`, `integrations/`, `dashboard/`, `.gitignore`) are eligible for `/sync-github`.
- **Auto-Backup Policy (User-Authorized)**: Whenever system files are created or updated, automatically run the privacy audit (`git status`, verify `.gitignore`, check `git diff --cached --name-only` has zero personal paths) and commit + `git push` to `origin` without extra confirmation. If ANY forbidden personal path appears, STOP immediately and warn the user.
