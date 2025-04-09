import { Server } from 'socket.io';

const SocketHandler = (req: any, res: any) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      socket.on('scoreUpdate', (data) => {
        socket.broadcast.emit('scoreUpdated', data);
      });
    });
  }
  res.end();
};

export default SocketHandler;