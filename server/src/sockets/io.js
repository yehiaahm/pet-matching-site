let ioInstance;

export const initIO = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('chat:join', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('disconnect', () => {
      // no-op
    });
  });
};

export const io = {
  to: (room) => ioInstance.to(room),
};
