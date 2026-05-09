const knex = require('knex')({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for NeonDB
  },
  pool: { min: 0, max: 10 },
});

async function initDB() {
  // Users
  if (!(await knex.schema.hasTable('users'))) {
    await knex.schema.createTable('users', (t) => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.string('email').unique().notNullable();
      t.string('password').notNullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('✅ Created table: users');
  }

  // Projects
  if (!(await knex.schema.hasTable('projects'))) {
    await knex.schema.createTable('projects', (t) => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.text('description').defaultTo('');
      t.integer('owner_id').references('id').inTable('users').onDelete('SET NULL').nullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('✅ Created table: projects');
  }

  // Project Members
  if (!(await knex.schema.hasTable('project_members'))) {
    await knex.schema.createTable('project_members', (t) => {
      t.integer('project_id').references('id').inTable('projects').onDelete('CASCADE');
      t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      t.string('role').defaultTo('Member').checkIn(['Admin', 'Member']);
      t.primary(['project_id', 'user_id']);
    });
    console.log('✅ Created table: project_members');
  }

  // Tasks
  if (!(await knex.schema.hasTable('tasks'))) {
    await knex.schema.createTable('tasks', (t) => {
      t.increments('id').primary();
      t.integer('project_id').references('id').inTable('projects').onDelete('CASCADE');
      t.string('title').notNullable();
      t.text('description').defaultTo('');
      t.string('status').defaultTo('Todo').checkIn(['Todo', 'In Progress', 'Done']);
      t.string('priority').defaultTo('Medium').checkIn(['Low', 'Medium', 'High']);
      t.integer('assigned_to').references('id').inTable('users').onDelete('SET NULL').nullable();
      t.date('due_date').nullable();
      t.integer('created_by').references('id').inTable('users').onDelete('SET NULL').nullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('✅ Created table: tasks');
  }

  console.log('✅ NeonDB schema ready');
}

module.exports = { knex, initDB };
