import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function resolveSocketServerUrl(apiBase: string): string {
  try {
    if (apiBase.startsWith('/')) {
      return window.location.origin;
    }

    const parsed = new URL(apiBase, window.location.origin);
    return parsed.origin;
  } catch {
    return window.location.origin;
  }
}

export function initSocket(apiBase: string, userId: string) {
  const serverUrl = resolveSocketServerUrl(apiBase);

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(serverUrl, {
    withCredentials: true,
  });

  socket.on('connect', () => {
    socket?.emit('registerUser', userId);
  });

  return socket;
}

export function onInstantAlert(cb: (payload: any) => void) {
  socket?.on('instantAlert', cb);
}

export function onSystemAnnouncement(cb: (payload: any) => void) {
  socket?.on('systemAnnouncement', cb);
}

export function offInstantAlert(cb: (payload: any) => void) {
  socket?.off('instantAlert', cb);
}

export function offSystemAnnouncement(cb: (payload: any) => void) {
  socket?.off('systemAnnouncement', cb);
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
