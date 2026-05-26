const express = require('express');
const { pool } = require('../lib/db');
const router = express.Router();
const q = (t, p = []) => pool.query(t, p).then(r => r.rows);

// Create/list risk tiers (minimal for config)
router.get('/risk-tiers', async (_req, res) => res.json(await q('SELECT * FROM risk_tiers ORDER BY level DESC')));
router.post('/risk-tiers', async (req, res) => {
  const { key, name, level, requires_approval, sla_minutes, escalation_policy } = req.body;
  const rows = await q(`INSERT INTO risk_tiers(key,name,level,requires_approval,sla_minutes,escalation_policy) VALUES ($1,$2,$3,COALESCE($4,false),COALESCE($5,0),COALESCE($6,'{}'::jsonb)) RETURNING *`, [key, name, level, requires_approval, sla_minutes, escalation_policy]);
  res.status(201).json(rows[0]);
});

// Create/list approval gates
router.get('/approval-gates', async (_req, res) => res.json(await q('SELECT * FROM approval_gates WHERE active=true ORDER BY id DESC')));
router.post('/approval-gates', async (req, res) => {
  const { scope, workspace_id, customer_id, suite_id, overlay_id, skill_id, risk_tier_min, actions, owners, owner_group, sla_minutes, escalation, config, active } = req.body;
  const rows = await q(`INSERT INTO approval_gates(scope,workspace_id,customer_id,suite_id,overlay_id,skill_id,risk_tier_min,actions,owners,owner_group,sla_minutes,escalation,config,active) VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,0),COALESCE($8,ARRAY[]::TEXT[]),COALESCE($9,ARRAY[]::TEXT[]),$10,COALESCE($11,0),COALESCE($12,'{}'::jsonb),COALESCE($13,'{}'::jsonb),COALESCE($14,true)) RETURNING *`, [scope, workspace_id, customer_id, suite_id, overlay_id, skill_id, risk_tier_min, actions, owners, owner_group, sla_minutes, escalation, config, active]);
  res.status(201).json(rows[0]);
});

// Policy evaluation (pre-run). Decides allow vs require approval.
router.post('/policy/evaluate', async (req, res) => {
  const { run_id, workspace_id, customer_id, skill_id, risk_tier = 0, actions = [] } = req.body;
  // Fetch gates applicable by scope (simplified: global + workspace + customer + skill)
  const gates = await q(`
    SELECT * FROM approval_gates WHERE active=true AND (
      scope='global' OR (scope='workspace' AND workspace_id=$1) OR (scope='customer' AND customer_id=$2) OR (scope='skill' AND skill_id=$3)
    ) ORDER BY risk_tier_min DESC`, [workspace_id || null, customer_id || null, skill_id || null]);
  let requires = false, gate = null;
  for (const g of gates) {
    if (risk_tier >= (g.risk_tier_min || 0)) {
      // If any action overlaps, require approval
      if (!g.actions || g.actions.length === 0 || actions.some(a => g.actions.includes(a))) {
        requires = true; gate = g; break;
      }
    }
  }
  if (requires && run_id) {
    // Create approval request and set run state awaiting_approval
    const owners = gate.owners || [];
    const slaMinutes = gate.sla_minutes || 0;
    const rows = await q(`INSERT INTO approval_requests(run_id, gate_id, owners, sla_deadline) VALUES ($1,$2,$3, COALESCE($4,0) > 0 ? now() + ($4 || 0) * INTERVAL '1 minute' : NULL) RETURNING *`, [run_id, gate.id, JSON.stringify(owners), slaMinutes]);
    await q(`UPDATE skill_runs SET state='awaiting_approval', updated_at=now() WHERE id=$1`, [run_id]);
    await q(`INSERT INTO audit_logs(run_id,event_type,data) VALUES ($1,'approval_required',$2)`, [run_id, { gate_id: gate.id, owners, sla_minutes: slaMinutes }]);
    return res.json({ allowed: false, requires_approval: true, gate_id: gate.id, approval_request: rows[0] });
  }
  return res.json({ allowed: !requires, requires_approval: requires, gate_id: gate ? gate.id : null });
});

// Approval decision (human)
router.post('/approvals/:id/decision', async (req, res) => {
  const id = req.params.id; const { status, decided_by, note } = req.body; // status 'approved'|'rejected'|'canceled'
  const rows = await q(`UPDATE approval_requests SET status=$1, decided_by=$2, decided_at=now(), decision_note=$3 WHERE id=$4 RETURNING *`, [status, decided_by, note, id]);
  const ar = rows[0];
  if (ar && ar.run_id) {
    if (status === 'approved') {
      await q(`UPDATE skill_runs SET state='approved', updated_at=now() WHERE id=$1`, [ar.run_id]);
      await q(`INSERT INTO audit_logs(run_id,event_type,data) VALUES ($1,'approval_granted',$2)`, [ar.run_id, { approval_request_id: ar.id, decided_by }]);
    } else if (status === 'rejected' || status === 'canceled') {
      await q(`UPDATE skill_runs SET state='failed', failed_at=now(), updated_at=now() WHERE id=$1`, [ar.run_id]);
      await q(`INSERT INTO audit_logs(run_id,event_type,data) VALUES ($1,'approval_denied',$2)`, [ar.run_id, { approval_request_id: ar.id, decided_by, note }]);
    }
  }
  res.json(ar || null);
});

// Attach post-run approval evidence (e.g., screenshots, diffs, receipts)
router.post('/approvals/:id/evidence', async (req, res) => {
  const id = req.params.id; const { evidence } = req.body; // any JSON payload; append to array
  const rows = await q(`UPDATE approval_requests SET evidence = COALESCE(evidence,'[]'::jsonb) || COALESCE($1,'[]'::jsonb) WHERE id=$2 RETURNING *`, [evidence, id]);
  const ar = rows[0];
  if (ar && ar.run_id) {
    await q(`INSERT INTO audit_logs(run_id,event_type,data) VALUES ($1,'approval_evidence',$2)`, [ar.run_id, { approval_request_id: ar.id, count: Array.isArray(evidence) ? evidence.length : 1 }]);
  }
  res.json(ar || null);
});

// List approval requests
router.get('/approvals', async (req, res) => {
  const { status, owner } = req.query;
  const where = [];
  const params = [];
  if (status) { params.push(status); where.push(`status=$${params.length}`); }
  if (owner) { params.push(owner); where.push(`(owner=$${params.length} OR $${params.length}=ANY(owners::text[]))`); }
  const sql = `SELECT * FROM approval_requests ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 200`;
  res.json(await q(sql, params));
});

module.exports = router;
