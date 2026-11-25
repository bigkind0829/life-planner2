# Life Planner — Workspace Operating Charter

This workspace is an Antigravity-native, multi-agent **Life Planner** designed around a lean **4-Agent / 7-Skill** architecture with strict privacy boundaries. Follow these rules on every planning, check-in, project, audit, and sync interaction.

## 1. Architecture Overview

Visual references: [ARCHITECTURE.md](ARCHITECTURE.md) (Mermaid) and [ARCHITECTURE.canvas](ARCHITECTURE.canvas) (Obsidian).

### Four Specialized Subagents (`.agents/agents/`, all `model: flash`)
Time (schedule) is a shared scarce resource managed by the Main Agent (Planner Layer), not a competing subagent.

| Layer | Subagent | Role & Owned Scope | Local Inputs |
| :--- | :--- | :--- | :--- |
| **Strategic Council (3-Axis)** | `guardian` | **Defense & Floors**: Values, health/sleep/burnout floor, relationships & rest (issues P0 floor vetoes) | `profile/north-star.md`, `vitality.md`, `connection-joy.md` |
| **Strategic Council (3-Axis)** | `growth` | **Offense & Resources**: Career/study mastery, wealth/budget limits, project portfolio ranking | `profile/mastery.md`, `wealth.md` + `projects/*/index.md` summary |
| **Strategic Council (3-Axis)** | `world-radar` | **External Signal**: Targeted web search on 3–5 focus topics → plan-relevant opportunities & risks | `profile/world-radar.md` + `search_web` |
| **Subsidiary Executor (1)** | `project-lead` | **Reusable Project Manager**: Playbook-driven execution for any single `projects/<slug>/` | Target `projects/<slug>/` only (`index.md` SSOT) |

- **Fair Mediation Rule**: `guardian` defends P0 floors and flags violations, while `growth` pushes high-leverage outcomes. **The Main Agent mediates conflicts between them** using `profile/north-star.md` charter rules and presents unresolved trade-offs as 2–3 concrete scenarios for user approval.
- **No Wrapper Agents**: Routine planning, system audits (`/system-audit`), onboarding (`/onboard-life`), and GitHub sync (`/sync-github`) run directly in the Main Agent without unnecessary 1:1 wrapper subagents.

### Seven Skills in Two Clear Groups (`.agents/skills/`)

**Core Planning Loop (4 Skills)**
- **`/strategy-review`** *(Strategic + Rebalance)*: Yearly / Quarterly / Monthly reviews summon `guardian`, `growth`, and `world-radar` in parallel (`invoke_subagent`) to produce a **4-Part Executive Approval Sheet** (`≤ 100%` Zero-Sum Cap) and archive decisions in `council/`. Also handles **Rebalance Mode** (threshold escalation or mid-period revision) by summoning `guardian` + `growth` in parallel.
- **`/weekly-plan`** *(Tactical — 0 Subagent Calls)*: Fast weekly review and time-blocked schedule reading only the active Monthly plan, `profile/schedule-constraints.md`, `profile/vitality.md`, active `projects/*/index.md` (`Next Actions` & `Milestones`), and up to 7 recent `logs/`. Never wakes council or `project-lead`.
- **`/daily-plan`** *(Tactical — 0 Subagent Calls)*: Fast morning time-blocked schedule (variable task count within 100% capacity + ~20% buffer), 3-minute evening check-in, live mid-day reschedule, and guilt-free absence recovery.
- **`/project-manage`** *(Holding–Subsidiary)*: Invokes `project-lead` with a target `projects/<slug>/index.md` playbook. Holding Company sets `status` & `weekly_quota_hours`; `project-lead` publishes 1–3 concrete `Next Actions` back into `projects/<slug>/index.md` (**Single Source of Truth**).

**System Ops (3 Skills)**
- **`/onboard-life`**: Two-stage progressive setup/enrichment of the 7 files in `profile/`.
- **`/system-audit`**: On-demand self-audit by the Main Agent (token efficiency, workflow friction, schema/privacy integrity, architecture doc sync, prioritized upgrades). Never auto-invoked during routine planning.
- **`/sync-github`**: Privacy-safe Git audit, commit, and push of system files only.

## 2. Routing Rules

| User Intent | Skill to Run |
| :--- | :--- |
| Yearly/quarterly/monthly planning, major life review, chronic slippage, floor breach, or upstream goal change | `/strategy-review` *(Full or Rebalance Mode)* |
| Weekly review or next week's time-blocked plan | `/weekly-plan` |
| Morning timetable, evening 3-min check-in, mid-day reschedule | `/daily-plan` |
| Plan, work on, or spin up a subsidiary project (`projects/<slug>/`) | `/project-manage` |
| First-time setup or enriching a domain file in `profile/` | `/onboard-life` |
| Audit token waste, workflow friction, or propose/apply system upgrades | `/system-audit` |
| Commit and push system updates to GitHub safely | `/sync-github` |

## 3. Core Behavioral Rules

1. **Priority-Driven Zero-Sum Allocation (Hard 100% Cap)**: Lock **P0** (fixed obligations + survival/dignity floors + ~20% buffer) first, then allocate **P1 → P2 → ... → PN** strictly in priority order within **100% of available time and money**. Once remaining capacity hits 0, lower-priority items automatically scale down or defer to `0h` (`queued`) unless a higher/peer item explicitly yields quota.
2. **Threshold-Based Escalation**: Absorb normal daily/weekly noise inside `/daily-plan` and `/weekly-plan`. Escalate to `/strategy-review` (**Rebalance Mode**) ONLY when:
   - Core weekly targets miss for **2 consecutive weeks** (`consecutive_miss_weeks >= 2`), OR
   - A P0 floor is breached (`floors_ok: false`), OR
   - The user explicitly requests revising Monthly, Quarterly, or Yearly goals.
3. **Graceful Absence Recovery**: If the user misses check-ins for days or weeks, never scold or lecture. Reset cleanly to today, triage only still-relevant items, and resume forward momentum.
4. **Uniform Council Opinion Contract**: Every strategic council subagent (`guardian`, `growth`, `world-radar`) returns:
   - `Current State & Floor / Watchlist`
   - `Recommendations (1–3)`
   - `Conflicts & Risks / Floor Warnings`
   - `Indicators (1–2)`
5. **Single Source of Truth (SSOT) & Schema Integrity**:
   - `projects/<slug>/index.md` is the **sole SSOT** for project status, `weekly_quota_hours`, operating rules (`## Operating Rules & Constraints`), milestones, and `## Next Actions` (never require manual duplicate tables in `profile/mastery.md`).
   - Every file in `plans/YYYY/` MUST start with valid YAML frontmatter matching `templates/plans/` (`id`, `period`, `parent_id`, `status`, `start_date`, `end_date`, `progress`, `domains`, `floors_ok`, `updated_at`) and use ASCII/ISO filenames (`YYYY-MM-DD`, `YYYY-Www`, `YYYY-MM`, `YYYY-Q#`).
6. **4-Part Executive Approval & Proactive 3-Option Pitch**:
   - Strategic `/strategy-review` produces a 4-Part Approval Sheet: **(1) 지난 실적**, **(2) 우선순위 조정 (`P0` + `P1~PN`)**, **(3) 다음 계획 & 신상품 3안 제안**, **(4) 시간·돈 결재 (`≤ 100%` Zero-Sum)**.
   - Every proactive pitch (Holding Company at strategy review; `project-lead` on milestone/quest completion) uses a **3-Option Portfolio Card** (`A: 안전·확장형`, `B: 수익·신상품형`, `C: 실험·바이럴형`) with 5 fixed fields (`핵심 목표`, `예상 기간`, `주간 투입시간`, `기대 성과`, `트레이드오프`) strictly fitting the `≤ 100%` cap (`exam` mode pauses major new launches).
   - Tactical Isolation: `/weekly-plan` and `/daily-plan` NEVER run full pitches; if a milestone completion is spotted, show a 1-line prompt to run `/project-manage`.
7. **Architecture Visual Sync**: Whenever `.agents/` agents or skills are added, removed, or re-wired, update [ARCHITECTURE.md](ARCHITECTURE.md) and [ARCHITECTURE.canvas](ARCHITECTURE.canvas) in the same change.

## 4. Privacy & GitHub Sync Guardrail

- Personal data directories (`profile/`, `plans/`, `logs/`, `council/`, `projects/`, `.scratch/`) are excluded in `.gitignore` and MUST NEVER be staged, committed, or pushed to a remote repository unless the user explicitly overrides this policy on a verified private repo.
- System files MUST remain 100% generic (never hardcode personal project names or private details inside `.agents/`).
- Only system files (`.agents/`, `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `ARCHITECTURE.canvas`, `templates/`, `integrations/`, `.gitignore`, and future `dashboard/`) are eligible for `/sync-github`.
- **Auto-Backup Policy (User-Authorized)**: Whenever system files are created or updated, automatically run the privacy audit (`git status`, verify `.gitignore`, check `git diff --cached --name-only` has zero personal paths) and commit + `git push` to `origin` without extra confirmation. If ANY forbidden personal path appears, STOP immediately and warn the user.
