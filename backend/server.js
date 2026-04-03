require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.set('io', io);
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
const squadRoutes = require('./src/routes/squad.routes');
const adminRoutes = require('./src/routes/admin.routes');

app.use('/api/auth', authRoutes);
app.use('/api/code_grind', codeGrindRoutes);
app.use('/api/squad', squadRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Setup Socket.IO
const initSquadJobs = require('./src/jobs/squad.jobs');
initSquadJobs(io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const defaultSecret = process.env.JWT_SECRET || 'supersecrethackathontoken';
    socket.user = jwt.verify(token, defaultSecret);
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected via authenticated socket:', socket.user.id);
  
  socket.on('join_squad', async (squadId) => {
    try {
      const check = await pool.query('SELECT squad_id FROM squad_members WHERE user_id = $1 AND squad_id = $2 AND is_active = true', [socket.user.id, squadId]);
      if (check.rows.length > 0) {
        socket.join(`squad_${squadId}`);
        socket.squadId = squadId;
        console.log(`User ${socket.user.id} joined squad_${squadId} room securely`);
      } else {
        socket.emit('squad_removed');
      }
    } catch(e) { console.error('Join squad db error:', e); }
  });

  socket.on('send_message', async (data) => {
    // data: { squad_id, user_id, message, user_name }
    try {
      // Secure check: verify they belong to this room and identity matches
      if (socket.squadId != data.squad_id || socket.user.id != data.user_id) {
         return; // Unauthorized payload
      }
      // Broadcast to room
      io.to(`squad_${data.squad_id}`).emit('receive_message', {
        ...data,
        created_at: new Date()
      });
      // Save to db
      await pool.query(
        'INSERT INTO squad_chat_messages (squad_id, user_id, message) VALUES ($1, $2, $3)',
        [data.squad_id, data.user_id, data.message]
      );
    } catch (e) {
      console.error('Socket send_message error:', e);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.id);
  });
});

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
