require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// In production allow the Vercel frontend; in dev allow localhost
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // No origin = Postman / curl / same-origin — always allow
    if (!origin) return callback(null, true);
    // If no FRONTEND_URL set yet, allow all (useful during initial deploy)
    if (allowedOrigins.length === 1 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
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

// Startup diagnostics
console.log('🔍 DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('🔍 JWT_SECRET set:   ', !!process.env.JWT_SECRET);
console.log('🔍 PORT:             ', process.env.PORT || 3000);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Team Task Manager API running at http://localhost:${PORT}`);
    console.log(`📦 Database: NeonDB (PostgreSQL)\n`);
  });
}).catch((err) => {
  console.error('❌ Failed to initialize database:');
  console.error('   Message:', err.message);
  console.error('   Code:   ', err.code);
  console.error('   Stack:  ', err.stack);
  process.exit(1);
});
