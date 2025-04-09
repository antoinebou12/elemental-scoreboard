import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io');
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('score-update', (data) => {
        try {
          io.emit('score-updated', data);
          console.log('Score updated and broadcast');
        } catch (error) {
          console.error('Error broadcasting score:', error);
          socket.emit('error', { message: 'Failed to broadcast score update' });
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, 'Reason:', reason);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export const config = {
  api: {
    bodyParser: false
  }
};

export default SocketHandler;