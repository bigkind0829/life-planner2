---
name: project-manage
description: Subsidiary project management workflow (Holding-Subsidiary architecture). Delegates project planning, deliverables, and milestone pitches to the reusable project-lead subagent using each project's local projects/<slug>/index.md playbook as Single Source of Truth.
---

# Project Manage (Subsidiary Project Workflow)

Manage individual Life Planner projects (`projects/<slug>/`) end-to-end without bloating daily/weekly planning context or proliferating per-project system agent files.

## When to Run

- User asks to plan, brainstorm, work on, or update a specific project under `projects/<slug>/`, OR
- User asks to spin up a new subsidiary project (`projects/<new-slug>/`).

## Process

### Mode A: Work With an Existing Project

1. Identify the target folder under `projects/<slug>/` and read its `index.md` (`status`, `weekly_quota_hours`, `## Operating Rules & Constraints`, `## Milestones`).
2. Invoke the reusable **`project-lead`** subagent via `invoke_subagent` (or `owner_agent` if a specialized tool/model agent is explicitly configured), passing:
   - Target project path: `projects/<slug>/`
   - Current `status`, `weekly_quota_hours`, and active schedule mode (`semester` / `exam` / `vacation`)
   - The user's request (plus a reminder to follow `projects/<slug>/index.md`'s local `## Operating Rules & Constraints` playbook)
3. Present `project-lead`'s structured plan/deliverable clearly to the user.
4. **Proactive Next Quest / New Product Pitch (Event Trigger)**: When the project's current milestone or quest completes (or is within ~3 days of finishing), ask `project-lead` to pitch a **3-Option Portfolio Card** (`A: 안전·확장형`, `B: 수익·신상품형`, `C: 실험·바이럴형`) with 5 fixed fields (`핵심 목표`, `예상 기간`, `주간 투입시간`, `기대 성과`, `트레이드오프`) fitting strictly inside `weekly_quota_hours` (escalate to `/strategy-review` for Zero-Sum `≤ 100%` reallocation if extra quota is needed; pause major new launches in `exam` mode).
5. Once approved (or for direct idea capture), update **`projects/<slug>/index.md`** (the **Single Source of Truth**: `## Next Actions (Synced to Weekly/Daily)`, `## Milestones`, `## Ideas & Backlog`, `updated_at`) and save any extra deliverables inside `projects/<slug>/`.
   - Do **NOT** duplicate project tables manually in `profile/mastery.md` — `projects/*/index.md` is the sole SSOT read by `/strategy-review` and `/weekly-plan`.

### Mode B: Spin Up a New Project

1. Create `projects/<slug>/index.md` from `templates/projects/project-index.md` (local only — protected by `.gitignore`) with `owner_agent: "project-lead"` and concrete `## Operating Rules & Constraints` capturing the project's playbook.
2. Do **NOT** create a new `.agents/agents/project-<slug>.md` file by default (keeps system prompt overhead `O(1)` and keeps personal project details strictly local). Only add a dedicated custom agent if the project genuinely requires different tool permissions or a different model class.
