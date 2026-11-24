---
name: system-audit
description: On-demand project maintenance and upgrade workflow for Life Planner. Invokes system-architect to audit token waste, workflow inefficiencies, schema/privacy integrity, and propose prioritized upgrades.
---

# System Audit (Project Management & Upgrade Workflow)

Audit, optimize, and evolve the Life Planner system itself without interfering with normal life planning.

## When to Run

- User invokes `/system-audit`, OR
- User asks in natural language to check token waste, find inefficiencies, review project structure, or brainstorm/implement Life Planner upgrades.
- **Never** auto-invoke during `/daily-plan`, `/weekly-plan`, `/strategy-review`, or `/rebalance`.

## Process

### 1. Delegate System Audit to `system-architect`

Invoke the `system-architect` subagent via `invoke_subagent`:
- Pass the user's specific focus (e.g., full audit, token efficiency check, upgrade brainstorming, or schema check).
- Wait for `system-architect` to return its 4-section audit report.

*(Note: If `system-architect` was just created in the current session and is not yet registered in the subagent list until the next session, perform the exact 4-dimension audit directly following `.agents/agents/system-architect.md`.)*

### 2. Present Findings & Get Approval

- Present a concise Korean summary of:
  1. **현재 시스템 상태** (토큰 무게, 스키마/프라이버시 안전성)
  2. **토큰 낭비 · 비효율 개선점** (번호 매김)
  3. **추천 업그레이드 제안** (Quick Wins vs. 다음 단계, 번호 매김)
- Ask the user which numbered items they want to apply now (never silently modify system files without confirmation).

### 3. Implement Approved Upgrades Safely

When the user selects items to implement:
1. Edit only the approved system files (`.agents/`, `AGENTS.md`, `templates/`, `README.md`, `integrations/`, `dashboard/`).
2. Keep `AGENTS.md` lean and preserve all core Life Planner contracts (6 MECE life domains, Phase 2 YAML schema, `.gitignore` privacy boundary).
3. Verify the modified files cleanly.
4. Offer to run `/sync-github` to safely commit and push the system upgrade to GitHub.
