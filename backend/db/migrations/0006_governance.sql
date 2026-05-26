-- Governance: risk tiers, approval gates, approval requests, enterprise policies

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE approval_status AS ENUM ('pending','approved','rejected','expired','canceled');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS risk_tiers (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  sla_minutes INTEGER DEFAULT 0,
  escalation_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approval_gates (
  id SERIAL PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('global','workspace','customer','suite','overlay','skill')),
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  suite_id INTEGER,
  overlay_id INTEGER,
  skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
  risk_tier_min INTEGER DEFAULT 0,
  actions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  owners TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  owner_group TEXT,
  sla_minutes INTEGER DEFAULT 0,
  escalation JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approval_requests (
  id SERIAL PRIMARY KEY,
  run_id INTEGER REFERENCES skill_runs(id) ON DELETE CASCADE,
  gate_id INTEGER REFERENCES approval_gates(id) ON DELETE SET NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  requested_by TEXT,
  owners JSONB NOT NULL DEFAULT '[]'::jsonb,
  owner TEXT,
  sla_deadline TIMESTAMPTZ,
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  decision_note TEXT,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enterprise_policies (
  id SERIAL PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('global','workspace','customer')),
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_requests_run ON approval_requests(run_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_gates_skill ON approval_gates(skill_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_policies_scope ON enterprise_policies(scope, workspace_id, customer_id) WHERE active = true;
