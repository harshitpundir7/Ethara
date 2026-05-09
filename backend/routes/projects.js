const router = require('express').Router();
const { knex } = require('../db');
const { authenticate } = require('../middleware/auth');
const { isMember, isAdmin } = require('../middleware/rbac');

// GET /api/projects
router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await knex('projects as p')
      .join('project_members as pm', function () {
        this.on('pm.project_id', 'p.id').andOn('pm.user_id', knex.raw('?', [req.user.id]));
      })
      .select(
        'p.*',
        'pm.role as user_role',
        knex('project_members').where('project_id', knex.ref('p.id')).count('* as cnt').as('member_count'),
        knex('tasks').where('project_id', knex.ref('p.id')).count('* as cnt').as('task_count'),
        knex('tasks').where('project_id', knex.ref('p.id')).where('status', 'Done').count('* as cnt').as('done_count')
      )
      .orderBy('p.created_at', 'desc');

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    // PostgreSQL: .returning() returns array of objects
    const [row] = await knex('projects')
      .insert({ name, description: description || '', owner_id: req.user.id })
      .returning('id');
    const id = row.id ?? row;

    await knex('project_members').insert({ project_id: id, user_id: req.user.id, role: 'Admin' });

    const project = await knex('projects').where({ id }).first();
    res.status(201).json({ ...project, user_role: 'Admin', member_count: 1, task_count: 0, done_count: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:id
router.get('/:id', authenticate, isMember, async (req, res) => {
  try {
    const project = await knex('projects').where({ id: req.params.id }).first();
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ ...project, user_role: req.projectRole });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/projects/:id
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });
    await knex('projects').where({ id: req.params.id }).update({ name, description: description || '' });
    const project = await knex('projects').where({ id: req.params.id }).first();
    res.json({ ...project, user_role: 'Admin' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await knex('projects').where({ id: req.params.id }).delete();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
