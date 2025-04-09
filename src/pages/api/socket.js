import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Client connected');
      
      socket.on('score-update', (data) => {
        console.log('Score update received:', data);
        io.emit('score-updated', data);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;