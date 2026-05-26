# Enterprise Claude Skills Platform

## Overview
This project sets up the base architecture for the Enterprise Claude Skills platform, including backend and frontend foundations, database, cache, and queue configurations.

## Setup

### Prerequisites
- Docker
- Node.js

### Installation
1. Clone the repository
2. Copy `.env.example` to `.env` and adjust settings as needed
3. Run `docker-compose up --build` to start the services

### Development
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm start`

### Health Check
- Access the health endpoint at `http://localhost:3000/health`

## Modules
- Skill Registry
- Department Suites
- Industry Overlays
- Entitlements
- Agent Profiles
- Routing
- Approvals
- Metering
- Audit Logs
- Admin UI

## License
MIT
### Suites & Overlays API (partial)
- GET/POST/PUT/DELETE /api/suites
- GET/POST/PUT/DELETE /api/overlays
- POST /api/suites/:id/skills | /api/suites/:id/packages
- POST /api/overlays/:id/skills | /api/overlays/:id/packages
- POST /api/overlays/:overlay_id/suites
- POST /api/activation/suites/workspace | /api/activation/suites/customer
- POST /api/activation/overlays/workspace | /api/activation/overlays/customer

### Commercial API (partial)
- Customers: GET/POST /api/customers
- Workspaces: GET/POST /api/workspaces
- Plans: GET/POST /api/plans, POST /api/plans/:plan_id/tiers
- Subscriptions: GET/POST /api/subscriptions
- Feature Flags: POST /api/feature-flags
- Entitlements: GET/POST /api/entitlements
- Credit Pools: GET/POST /api/credit-pools
- Activation Check: GET /api/activation/workspace/:id

### Agents, Tasks & Routing API (partial)
- Agents: GET/POST/PUT/DELETE /api/agents and /api/agents/:id
- Tasks:  GET/POST/PUT/DELETE /api/tasks and /api/tasks/:id
- Routing: POST /api/route (recommend), POST /api/route/apply (persist + run stub)
