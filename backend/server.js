require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Ensure users table exists at startup
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).then(() => {
  console.log('users table ready.');
}).catch(err => {
  console.error('Error ensuring users table:', err.message);
});

// Routes
const authRoutes = require('./src/routes/auth.routes');
const codeGrindRoutes = require('./src/routes/codegrind.routes');

app.use('/api/auth', authRoutes);
app.use('/api/code_grind', codeGrindRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
