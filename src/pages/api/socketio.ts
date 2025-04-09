import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: '/socket.io',
      addTrailingSlash: false,
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

    io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('score-update', (data) => {
        io.emit('score-updated', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;