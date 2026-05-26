MANDATORY BEFORE STARTING:

1. Read /memory/project_context.md
2. Read /memory/architecture.md
3. Read /memory/progress.md
4. Read /memory/decisions.md
5. Understand current system state
6. Do NOT break existing architecture
7. Follow the tech stack and module boundaries already established

MANDATORY AFTER COMPLETION:

1. Update /memory/architecture.md
2. Update /memory/progress.md
3. Update /memory/decisions.md
4. Add what was built
5. Add decisions made
6. Add API/contracts/schema changes
7. Add env/config added or changed
8. Add next recommended issue

---

# Architecture Summary
The platform is designed as a control plane for skills, licensing, routing, approvals, and billing. It consists of a Node.js backend with Express, a React frontend, PostgreSQL for data storage, and Redis with BullMQ for caching and queue management.

## Components
- Backend: Node.js, Express
- Frontend: React
- Database: PostgreSQL
- Cache/Queue: Redis, BullMQ

## Key Features
- Modular structure for scalability
- Health endpoints for monitoring
- Structured logging for observability
- Environment validation for configuration consistency
\n## [2026-05-26T09:11:24Z] THU-28 - Skill Run Tracking & Metering\n- Added DB migration 0005_skill_runs_audit.sql defining skill_runs, audit_logs, usage_charges, and run_state enum.\n- Implemented backend routes: /api/runs (create, state updates, output hashing, audit log append, credit charge), and queries.\n- Added metering lib to post usage charges and update credit_pools tallies.\n- Wired routes into Express app.\n
