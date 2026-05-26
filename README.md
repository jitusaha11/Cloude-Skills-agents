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