const router = require('express').Router({ mergeParams: true });
const { knex } = require('../db');
const { authenticate } = require('../middleware/auth');
const { isMember, isAdmin } = require('../middleware/rbac');

// GET /api/projects/:id/members
router.get('/', authenticate, isMember, async (req, res) => {
  try {
    const members = await knex('project_members as pm')
      .join('users as u', 'u.id', 'pm.user_id')
      .where('pm.project_id', req.params.id)
      .select('u.id', 'u.name', 'u.email', 'pm.role', 'u.created_at')
      .orderByRaw("pm.role DESC, u.name ASC");
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:id/members
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { email, role = 'Member' } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });
    if (!['Admin', 'Member'].includes(role))
      return res.status(400).json({ error: 'role must be Admin or Member' });

    const user = await knex('users').where({ email }).select('id', 'name', 'email').first();
    if (!user) return res.status(404).json({ error: 'No user found with that email' });

    const existing = await knex('project_members')
      .where({ project_id: req.params.id, user_id: user.id }).first();
    if (existing) return res.status(409).json({ error: 'User is already a member' });

    await knex('project_members').insert({ project_id: req.params.id, user_id: user.id, role });
    res.status(201).json({ ...user, role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/projects/:id/members/:uid
router.put('/:uid', authenticate, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Member'].includes(role))
      return res.status(400).json({ error: 'role must be Admin or Member' });

    if (parseInt(req.params.uid) === req.user.id && role === 'Member') {
      const { cnt } = await knex('project_members')
        .where({ project_id: req.params.id, role: 'Admin' })
        .count('* as cnt').first();
      if (cnt <= 1)
        return res.status(400).json({ error: 'Project must have at least one Admin' });
    }

    await knex('project_members')
      .where({ project_id: req.params.id, user_id: req.params.uid })
      .update({ role });
    res.json({ message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id/members/:uid
router.delete('/:uid', authenticate, isAdmin, async (req, res) => {
  try {
    const uid = parseInt(req.params.uid);
    if (uid === req.user.id) {
      const { cnt } = await knex('project_members')
        .where({ project_id: req.params.id, role: 'Admin' })
        .count('* as cnt').first();
      if (cnt <= 1)
        return res.status(400).json({ error: 'Cannot remove the only Admin' });
    }
    await knex('project_members')
      .where({ project_id: req.params.id, user_id: uid }).delete();
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
