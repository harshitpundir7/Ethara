const { knex } = require('../db');

async function requireRole(req, res, next, roles = []) {
  const projectId = req.params.id || req.params.projectId;
  const userId = req.user.id;

  const member = await knex('project_members')
    .where({ project_id: projectId, user_id: userId })
    .first();

  if (!member) return res.status(403).json({ error: 'You are not a member of this project' });
  if (roles.length && !roles.includes(member.role))
    return res.status(403).json({ error: 'Insufficient permissions' });

  req.projectRole = member.role;
  next();
}

const isMember = (req, res, next) => requireRole(req, res, next, []);
const isAdmin  = (req, res, next) => requireRole(req, res, next, ['Admin']);

module.exports = { isMember, isAdmin };
