const router = require('express').Router({ mergeParams: true });
const { knex } = require('../db');
const { authenticate } = require('../middleware/auth');
const { isMember, isAdmin } = require('../middleware/rbac');

function taskQuery() {
  return knex('tasks as t')
    .leftJoin('users as u', 'u.id', 't.assigned_to')
    .leftJoin('users as c', 'c.id', 't.created_by')
    .select(
      't.*',
      'u.name as assignee_name', 'u.email as assignee_email',
      'c.name as creator_name'
    );
}

// GET /api/projects/:id/tasks
router.get('/', authenticate, isMember, async (req, res) => {
  try {
    const { status, priority, assigned_to } = req.query;
    let q = taskQuery().where('t.project_id', req.params.id).orderBy('t.created_at', 'desc');
    if (status)      q = q.where('t.status', status);
    if (priority)    q = q.where('t.priority', priority);
    if (assigned_to) q = q.where('t.assigned_to', assigned_to);
    res.json(await q);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:id/tasks (Admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, description, priority, assigned_to, due_date } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required' });

    // PostgreSQL: .returning() returns array of objects
    const [row] = await knex('tasks').insert({
      project_id:  req.params.id,
      title,
      description: description || '',
      priority:    priority || 'Medium',
      assigned_to: assigned_to || null,
      due_date:    due_date || null,
      created_by:  req.user.id,
    }).returning('id');
    const id = row.id ?? row;

    const task = await taskQuery().where('t.id', id).first();
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
