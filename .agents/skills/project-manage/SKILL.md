---
name: project-manage
description: Subsidiary project management workflow (Holding-Subsidiary architecture). Routes project planning, goal-setting, deliverables, and new subsidiary creation to dedicated project-<slug> agents and syncs Next Actions into projects/<slug>/index.md.
---

# Project Manage (Subsidiary Project Workflow)

Manage individual Life Planner subsidiaries (`projects/<slug>/`) end-to-end without bloating the Holding Company's daily/weekly planning context.

## When to Run

- User asks to plan, brainstorm, work on, or update a specific project (e.g., "의료 AI 동아리 운영 방식 정하자", "유튜브 아이디어 정리하자", "스타트업 아이디어 기록해줘"), OR
- User asks to spin up a new subsidiary project + agent (e.g., "과외 계열사 추가해줘", "시험공부 프로젝트 만들어줘").

## Process

### Mode A: Work With an Existing Subsidiary

1. Identify the target project folder under `projects/<slug>/` and read its `index.md` (`status`, `owner_agent`, `weekly_quota_hours`).
2. Invoke the project's dedicated subsidiary subagent (`owner_agent`, e.g., `project-med-ai-club`, `project-youtube`, `project-startup`) via `invoke_subagent`, passing the user's request plus current `status` and `weekly_quota_hours`.
3. Present the subsidiary agent's structured plan/deliverable clearly to the user.
4. **Proactive Next Quest / New Product Pitch (Event Trigger)**: When a subsidiary's current milestone or quest is completed (or within ~3 days of finishing), ask the subsidiary agent to proactively pitch a **3-Option Portfolio Card** (`A: 안전·확장형`, `B: 수익·신상품형`, `C: 실험·바이럴형`) with 5 fixed fields (`핵심 목표`, `예상 기간`, `주간 투입시간`, `기대 성과(수익/성장/유튜브 소재력)`, `트레이드오프`). Fit strictly inside `weekly_quota_hours` (if extra hours or budget are needed, escalate to Holding Company for a Zero-Sum `≤ 100%` reallocation; pause major new launches in `exam` mode).
5. Once approved (or for direct note/idea capture), update `projects/<slug>/index.md` (especially `## Next Actions (Synced to Weekly/Daily)`, `## Milestones`, `## Ideas & Backlog` for unchosen good ideas, and `updated_at`) and save any extra deliverables inside `projects/<slug>/`. If an approved quest/product has strong content value, note it as a quest candidate in `projects/youtube/index.md` (`## Ideas & Backlog`).
6. Keep `profile/mastery.md` (or the relevant domain profile) portfolio table in sync if `status` or `Next Milestone` changed.

### Mode B: Spin Up a New Subsidiary

1. Create `projects/<slug>/index.md` from `templates/projects/project-index.md` (local only — protected by `.gitignore`).
2. Add the project row to the portfolio table in the relevant domain profile (e.g., `profile/mastery.md`).
3. If the user wants a dedicated subsidiary agent, create `.agents/agents/project-<slug>.md` (`model: flash`, scoped strictly to `projects/<slug>/`, following the Holding–Subsidiary Quota ↔ Next Actions contract) and automatically back up ONLY the new system agent file via `/sync-github` per `AGENTS.md`.
