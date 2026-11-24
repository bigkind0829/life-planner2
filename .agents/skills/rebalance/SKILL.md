---
name: rebalance
description: Threshold-based escalation and conflict-mediation workflow. Selectively summons affected domain subagents plus north-star when weekly targets slip 2 consecutive weeks, a domain floor is breached, or the user requests upstream goal changes.
---

# Rebalance (Escalation & Selective Council Mediation)

Bridge tactical friction back into strategic alignment without over-reacting to single bad days.

## Escalation Triggers

Run this workflow when one or more triggers apply:
1. **Chronic Slippage**: Weekly core targets missed for **2 consecutive weeks** (`consecutive_miss_weeks >= 2`).
2. **Floor Breach**: A non-negotiable domain floor (`vitality`, `wealth`, `connection-joy`) is breached or repeatedly threatened (`floors_ok: false`).
3. **Explicit User Request**: The user asks to revise Monthly, Quarterly, or Yearly goals due to a life change, opportunity, or burnout.

## Process

### 1. Diagnose Scope

Read ONLY the active Monthly plan, at most the last 2 Weekly plans, at most the last 7 daily check-in files in `logs/`, and `profile/schedule-constraints.md` (`active_mode`). Identify **which domains are directly involved** (e.g., `mastery` + `vitality` for overwork; `wealth` + `mastery` for income pivot), and prepare a 3-line capacity & trigger summary to inject into summoned subagents so they do not re-read shared files.

### 2. Selective Parallel Council Summon

Summon ONLY the affected domain subagents **plus `north-star`** in parallel using `invoke_subagent` (for major life pivots affecting 4+ domains, summon all 6). Provide them the concrete trigger evidence (e.g., actual hours vs. planned, consecutive misses, floor breaches) and ask for the **Uniform Domain Opinion Contract**.

### 3. Mediate & Propose Adjustment Options

1. Use `north-star` charter rules to rank what stays protected vs. what should shrink, defer, or drop.
2. Present **2–3 concrete rebalancing options** (e.g., Option A: Reduce Monthly scope to protect Vitality floor; Option B: Shift timeline by 1 month; Option C: Temporarily trade off a non-floor item with explicit end date).
3. Wait for explicit user approval before modifying any Monthly, Quarterly, or Yearly plan.

### 4. Apply Approved Changes & Archive

1. Save the mediation record in `council/YYYY-MM-DD-rebalance.md` matching `templates/council/session-record.md` (`horizon: "rebalance"`).
2. Update the approved upstream plan(s) (`monthly`, and `quarterly`/`yearly` only if impacted) and reset `floors_ok: true` once constraints are restored.
3. Update the current week's plan to align with the revised targets.
