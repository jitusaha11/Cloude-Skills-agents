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
