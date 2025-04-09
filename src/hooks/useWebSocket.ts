import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const connectSocket = async () => {
        try {
          await fetch('/api/socket');
          const socket = io({
            path: '/api/socket',
            addTrailingSlash: false,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000
          });

          socket.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
          });

          socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
          });

          socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
          });

          socketRef.current = socket;
        } catch (error) {
          console.error('Failed to connect:', error);
          setIsConnected(false);
        }
      };

      connectSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const emit = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    isConnected,
    socket: socketRef.current,
    emit
  };
};

export default useWebSocket;