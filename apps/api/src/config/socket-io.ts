import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from './environment.js';
import { prisma } from '../lib/prisma-client.js';

let io: SocketIOServer;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
    path: '/socket.io',
  });

  // Auth middleware — validate JWT before allowing connection
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth as Record<string, string>)?.token ??
      socket.handshake.headers?.cookie?.match(/token=([^;]+)/)?.[1];
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Client joins a room keyed by BullMQ jobId — validates ownership first
    socket.on('job:subscribe', async (jobId: string) => {
      const download = await prisma.downloadedVideo.findFirst({
        where: { bullmqJobId: jobId, userId: socket.data.userId },
      });
      if (download) socket.join(jobId);
    });
    socket.on('job:unsubscribe', (jobId: string) => {
      socket.leave(jobId);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized — call initSocketIO first');
  return io;
}
