---
name: system-audit
description: On-demand self-audit and upgrade workflow for Life Planner. Main Agent audits token efficiency, workflow friction, schema/privacy integrity, and ARCHITECTURE visual sync, then proposes prioritized upgrades without adding wrapper subagent overhead.
---

# System Audit (Self-Audit & Upgrade Workflow)

Audit, optimize, and evolve the Life Planner system itself without interfering with normal life planning.

## When to Run

- User invokes `/system-audit`, OR
- User asks in natural language to check token waste, find inefficiencies, review workspace architecture, or brainstorm/implement Life Planner upgrades.
- **Never** auto-invoke during `/daily-plan`, `/weekly-plan`, `/strategy-review`, or `/project-manage`.

## Process

### 1. Run Direct 4-Dimension System Audit

Execute the audit directly in the Main Agent *(delegate broad read-only scans to the built-in `research` subagent only if the workspace grows large)* across system files (`.agents/`, `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `ARCHITECTURE.canvas`, `templates/`, `integrations/`, `.gitignore`) and structural metadata (not private content) of `profile/`, `plans/`, `logs/`, `council/`, `projects/`:

1. **Token & Context Efficiency**:
   - Check always-loaded prompt weight (`AGENTS.md`, `.agents/agents/*.md` count & descriptions, skill descriptions).
   - Detect redundant file reads, tactical subagent leaks (`/weekly-plan` and `/daily-plan` must remain 0 subagent calls), or unbounded log growth.
   - Verify model routing (`flash` for council & `project-lead`).
2. **Workflow & Architectural Cleanliness**:
   - Flag duplicate sources of truth (SSOT violations), unnecessary 1:1 wrapper agents, or ambiguous skill overlap.
   - Verify [ARCHITECTURE.md](../../../ARCHITECTURE.md) and [ARCHITECTURE.canvas](../../../ARCHITECTURE.canvas) match actual `.agents/` files.
3. **Schema & Privacy Integrity**:
   - Verify YAML frontmatter consistency between `templates/` and active `profile/`, `plans/`, `projects/` files (`parent_id` chains, ISO filenames).
   - Verify `.gitignore` protects all personal directories (`profile/`, `plans/`, `logs/`, `council/`, `projects/`, `.scratch/`, `.env`) and confirm `.agents/` contains zero hardcoded personal project names or private details.
4. **High-Leverage Upgrade Proposals**:
   - Rank concrete upgrades by **Impact vs. Effort** and explicit **Token Impact** (Quick Wins vs. Next-Phase).

### 2. Present Findings & Get Approval

Present a crisp Korean summary with 4 sections:
1. **현재 시스템 상태** (에이전트·스킬 수, 토큰 무게, 스키마/프라이버시/문서 동기화 상태)
2. **토큰 낭비 · 구조 비효율 (최대 5개, 번호 매김)**
3. **추천 업그레이드 제안 (Quick Wins vs. 다음 단계, 번호 매김)**
4. **추천 다음 액션** — ask which numbered items to apply (read-only audit by default; never silently rewrite system files without confirmation).

### 3. Implement Approved Upgrades Safely

When the user selects items to apply:
1. Edit only the approved system files (`.agents/`, `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `ARCHITECTURE.canvas`, `templates/`, `integrations/`, `dashboard/`).
2. If any agent, skill, or data contract changed, update `ARCHITECTURE.md` and `ARCHITECTURE.canvas` in the same change.
3. Per the Auto-Backup Policy in `AGENTS.md`, run the `/sync-github` privacy audit and commit + push verified system files to `origin`.
