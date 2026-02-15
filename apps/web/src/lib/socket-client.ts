import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('/', {
      path: '/socket.io',
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
}

export function subscribeToJob(jobId: string): void {
  getSocket().emit('job:subscribe', jobId);
}

export function unsubscribeFromJob(jobId: string): void {
  getSocket().emit('job:unsubscribe', jobId);
}
