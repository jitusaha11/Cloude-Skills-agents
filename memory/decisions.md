MANDATORY BEFORE STARTING:

1. Read /memory/project_context.md
2. Read /memory/architecture.md
3. Read /memory/progress.md
4. Read /memory/decisions.md
5. Understand current system state
6. Do NOT break existing architecture
7. Follow the tech stack and module boundaries already established

MANDATORY AFTER COMPLETION:

1. Update /memory/progress.md
2. Update /memory/decisions.md
3. Add what was built
4. Add decisions made
5. Add API/contracts/schema changes
6. Add env/config added or changed
7. Add next recommended issue

---

# Decisions
- Use Node.js and Express for backend due to familiarity and ecosystem support
- Use React for frontend to leverage component-based architecture
- Choose PostgreSQL for its reliability and feature set
- Use Redis and BullMQ for efficient caching and queue management
- Docker Compose for consistent local development environment
\n## [2026-05-26T09:11:24Z] THU-28 Decisions\n- Store tool_calls and approvals as JSONB on skill_runs for fast retrieval.\n- Output stored as SHA-256 hash only to avoid heavy payloads; raw output remains external.\n- Usage charges recorded per run, linked to active credit pool when present; pools accumulate consumed/overage.\n- Minimal cohesive API surface for create/update/audit/charge to keep module boundaries clear.\n
