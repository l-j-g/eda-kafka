import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';

let io: IOServer;

export function initSocketGateway(httpServer: HttpServer): IOServer {
  io = new IOServer(httpServer, {
    cors: { origin: 'http://localhost:4200', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.on('disconnect', () =>
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`)
    );
  });

  return io;
}

/**
 * Broadcast a Kafka event to all connected Angular clients.
 * eventType mirrors the Kafka event name, e.g. 'order.created'.
 */
export function broadcast(eventType: string, payload: object): void {
  if (!io) throw new Error('Socket.IO gateway not initialised');
  io.emit('kafka-event', { eventType, payload, timestamp: new Date().toISOString() });
  console.log(`[Gateway] broadcast ${eventType}`);
}
