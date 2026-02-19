import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(apiBase: string, userId: string) {
  socket = io(apiBase.replace(/\/api\/v1$/, ''));
  socket.emit('registerUser', userId);
  return socket;
}

export function onInstantAlert(cb: (payload: any) => void) {
  socket?.on('instantAlert', cb);
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
