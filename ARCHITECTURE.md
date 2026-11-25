# Life Planner Architecture (4-Agent · 7-Skill)

> Visual references: this Mermaid map (GitHub / IDE / Obsidian) and [ARCHITECTURE.canvas](ARCHITECTURE.canvas) (interactive Obsidian Canvas).

## System Topology

```mermaid
flowchart LR
    U["Main Agent<br/>(Life Planner · AGENTS.md)"]

    subgraph CORE["Core Planning Loop (4 Skills)"]
        direction TB
        S_STRAT["/strategy-review<br/>전략 · Rebalance 모드"]
        S_WEEK["/weekly-plan<br/>주간 타임블록 · 0 호출"]
        S_DAY["/daily-plan<br/>일간 · 체크인 · 0 호출"]
        S_PROJ["/project-manage<br/>자회사 프로젝트 위임"]
    end

    subgraph OPS["System Ops (3 Skills · 0 Subagent Calls)"]
        direction TB
        S_ONB["/onboard-life<br/>프로필 초기 설정"]
        S_AUD["/system-audit<br/>직접 시스템 감사"]
        S_SYNC["/sync-github<br/>프라이버시 안전 Push"]
    end

    subgraph COUNCIL["3-Axis Strategic Council (model: flash)"]
        direction TB
        A_GRD["guardian<br/>가치관 · 건강 · 관계 하한선"]
        A_GRW["growth<br/>커리어 · 재정 · 포트폴리오"]
        A_RAD["world-radar<br/>외부 트렌드 웹 검색"]
    end

    subgraph SUB["Subsidiary Executor (model: flash)"]
        A_PRJ["project-lead<br/>범용 자회사 매니저<br/>(로컬 플레이북 주입)"]
    end

    subgraph DATA["Local Personal Data (.gitignore)"]
        direction TB
        D_PROF["profile/<br/>7개 도메인·제약 파일"]
        D_PLAN["plans/YYYY/<br/>연·분기·월·주·일 계획"]
        D_CNCL["council/<br/>위원회 의견·중재 아카이브"]
        D_LOGS["logs/<br/>일일 3분 체크인"]
        D_PROJ["projects/*/index.md<br/>프로젝트 SSOT · Next Actions"]
    end

    REMOTE["GitHub Remote<br/>(시스템 파일 전용)"]

    U --> S_STRAT & S_WEEK & S_DAY & S_PROJ
    U --> S_ONB & S_AUD & S_SYNC

    S_STRAT ==>|"병렬 소환 (Rebalance: 2인)"| A_GRD & A_GRW
    S_STRAT ==>|"전략 회의 병렬 소환"| A_RAD
    S_PROJ ==>|"단일 프로젝트 격리 호출"| A_PRJ

    S_WEEK -.->|"2주 미달 / Floor 위반"| S_STRAT

    A_GRD -.-> D_PROF
    A_GRW -.-> D_PROF & D_PROJ
    A_RAD -.-> D_PROF
    A_PRJ -.->|"규칙 읽기 / Next Actions 쓰기"| D_PROJ

    S_STRAT -.-> D_PLAN & D_CNCL & D_PROJ
    S_WEEK -.->|"에이전트 미호출 직접 연동"| D_PLAN & D_PROJ & D_LOGS
    S_DAY -.-> D_PLAN & D_LOGS
    S_ONB -.-> D_PROF
    S_SYNC -.-> REMOTE
```

## Design Contracts

### 1. Subagent Layer (4 Agents, All `model: flash`)
| Agent | File | Role | Read Boundary |
| :--- | :--- | :--- | :--- |
| `guardian` | `.agents/agents/guardian.md` | P0 floor defense & veto warnings | `profile/north-star.md`, `vitality.md`, `connection-joy.md` |
| `growth` | `.agents/agents/growth.md` | Mastery, wealth, and priority ranking | `profile/mastery.md`, `wealth.md`, `projects/*/index.md` summary |
| `world-radar` | `.agents/agents/world-radar.md` | Targeted external signal via web search | `profile/world-radar.md` + `search_web` |
| `project-lead` | `.agents/agents/project-lead.md` | Reusable playbook-driven project manager | Assigned `projects/<slug>/` folder only |

### 2. Mediation & Zero-Sum Rule
- **`guardian` vs. `growth` Mediation**: `guardian` protects floors and issues hard warnings; `growth` pushes high-leverage deliverables and ROI. The **Main Agent** mediates trade-offs impartially using `profile/north-star.md` and submits unresolved choices (2–3 scenarios) for user approval.
- **Hard 100% Cap**: P0 (fixed obligations + survival/dignity floors + ~20% buffer) locks first; `P1 → PN` fills strictly within `≤ 100%` of time and budget.

### 3. Single Source of Truth (SSOT) & Privacy
- **`projects/<slug>/index.md` (SSOT)**: Holds `status`, `weekly_quota_hours`, `## Operating Rules & Constraints` (playbook), `## Milestones`, and `## Next Actions`. Holding Company (`/strategy-review`) sets quota; `project-lead` writes Next Actions; `/weekly-plan` reads Next Actions directly with **0 subagent calls**.
- **Privacy Separation**: System files (`.agents/`, `AGENTS.md`, `ARCHITECTURE.*`, `templates/`, `README.md`) contain **zero** personal project names or private details and sync to GitHub. Personal folders (`profile/`, `plans/`, `logs/`, `council/`, `projects/`) stay strictly local via `.gitignore`.
