const router = require('express').Router();
const { knex } = require('../db');
const { authenticate } = require('../middleware/auth');

function taskQuery() {
  return knex('tasks as t')
    .leftJoin('users as u', 'u.id', 't.assigned_to')
    .leftJoin('users as c', 'c.id', 't.created_by')
    .select('t.*', 'u.name as assignee_name', 'u.email as assignee_email', 'c.name as creator_name');
}

async function getMembership(taskId, userId) {
  return knex('tasks as t')
    .join('project_members as pm', function () {
      this.on('pm.project_id', 't.project_id').andOn('pm.user_id', knex.raw('?', [userId]));
    })
    .where('t.id', taskId)
    .select('pm.role')
    .first();
}

// PUT /api/tasks/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await knex('tasks').where({ id: req.params.id }).first();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const membership = await getMembership(req.params.id, req.user.id);
    if (!membership) return res.status(403).json({ error: 'Not a project member' });

    const { title, description, status, priority, assigned_to, due_date } = req.body;

    if (membership.role === 'Member') {
      if (title !== undefined || description !== undefined || priority !== undefined ||
          assigned_to !== undefined || due_date !== undefined) {
        return res.status(403).json({ error: 'Members can only update task status' });
      }
      if (!status) return res.status(400).json({ error: 'status is required' });
      await knex('tasks').where({ id: req.params.id }).update({ status });
    } else {
      const updates = {};
      if (title !== undefined)       updates.title = title;
      if (description !== undefined) updates.description = description;
      if (status !== undefined)      updates.status = status;
      if (priority !== undefined)    updates.priority = priority;
      if (assigned_to !== undefined) updates.assigned_to = assigned_to;
      if (due_date !== undefined)    updates.due_date = due_date;
      await knex('tasks').where({ id: req.params.id }).update(updates);
    }

    res.json(await taskQuery().where('t.id', req.params.id).first());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tasks/:id (Admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await knex('tasks').where({ id: req.params.id }).first();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const membership = await getMembership(req.params.id, req.user.id);
    if (!membership) return res.status(403).json({ error: 'Not a project member' });
    if (membership.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });

    await knex('tasks').where({ id: req.params.id }).delete();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
