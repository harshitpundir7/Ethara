const router = require('express').Router();
const { knex } = require('../db');
const { authenticate } = require('../middleware/auth');

// GET /api/dashboard
router.get('/', authenticate, async (req, res) => {
  try {
    const uid = req.user.id;

    const { cnt: totalProjects } = await knex('project_members')
      .where({ user_id: uid }).count('* as cnt').first();

    // PostgreSQL uses CURRENT_DATE (not DATE('now') which is SQLite)
    const taskStats = await knex('tasks as t')
      .join('project_members as pm', function () {
        this.on('pm.project_id', 't.project_id').andOn('pm.user_id', knex.raw('?', [uid]));
      })
      .select(
        knex.raw('COUNT(*) as total'),
        knex.raw("SUM(CASE WHEN t.status = 'Done'        THEN 1 ELSE 0 END) as done"),
        knex.raw("SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress"),
        knex.raw("SUM(CASE WHEN t.status = 'Todo'        THEN 1 ELSE 0 END) as todo"),
        knex.raw("SUM(CASE WHEN t.status != 'Done' AND t.due_date < CURRENT_DATE THEN 1 ELSE 0 END) as overdue")
      )
      .first();

    // Tasks assigned to me, soonest due first
    const myTasks = await knex('tasks as t')
      .join('projects as p', 'p.id', 't.project_id')
      .where('t.assigned_to', uid)
      .select(
        't.id', 't.title', 't.status', 't.priority', 't.due_date',
        'p.name as project_name', 'p.id as project_id'
      )
      .orderByRaw('CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END, t.due_date ASC')
      .limit(10);

    // Recent projects
    const recentProjects = await knex('projects as p')
      .join('project_members as pm', function () {
        this.on('pm.project_id', 'p.id').andOn('pm.user_id', knex.raw('?', [uid]));
      })
      .select(
        'p.id', 'p.name', 'p.description', 'pm.role as user_role',
        knex('tasks').where('project_id', knex.ref('p.id')).count('* as cnt').as('task_count'),
        knex('tasks').where('project_id', knex.ref('p.id')).where('status', 'Done').count('* as cnt').as('done_count'),
        knex('project_members').where('project_id', knex.ref('p.id')).count('* as cnt').as('member_count')
      )
      .orderBy('p.created_at', 'desc')
      .limit(6);

    res.json({ totalProjects, taskStats, myTasks, recentProjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
