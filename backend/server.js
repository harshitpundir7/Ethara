require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL, // set this in Railway Variables if deploying frontend too
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth',                 require('./routes/auth'));
app.use('/api/projects',             require('./routes/projects'));
app.use('/api/projects/:id/members', require('./routes/members'));
app.use('/api/projects/:id/tasks',   require('./routes/tasks'));
app.use('/api/tasks',                require('./routes/taskActions'));
app.use('/api/dashboard',            require('./routes/dashboard'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Team Task Manager API running at http://localhost:${PORT}`);
    console.log(`📦 Database: NeonDB (PostgreSQL)\n`);
  });
}).catch((err) => {
  console.error('❌ Failed to initialize database:', err.message);
  process.exit(1);
});
