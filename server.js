import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://*.app.github.dev',
      'http://localhost:8080',
      'http://localhost:3001'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(cors());

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('score-update', (data) => {
    io.emit('score-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = process.env.PORT || 3001;
server.listen(port, '0.0.0.0', () => {
  console.log(`WebSocket server running on port ${port}`);
});