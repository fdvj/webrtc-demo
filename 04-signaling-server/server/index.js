const io = require('socket.io')(80);

// Keeps track of the users connected to the room
const roomUsers = [];

io.on('connection', (socket) => {
  // On first connection send updated list of users
  socket.emit('roomUpdated', listUsers());

  // When someone joins, notify everyone to update their lists
  socket.on('join', (user) => {
    addUser(socket.id, user);
    io.emit('roomUpdated', listUsers());
  });

  // Triggered when a call is happening
  socket.on('call', (msg) => signalExchange(socket, msg));

  // Triggered when an answer happens. It is the same, but for clarity's sake
  // in the client process, I've separated them here
  socket.on('answer', (msg) => signalExchange(socket, msg));

  // When someone disconnects, remove him from the list and notify everyone
  socket.on('disconnect', () => {
    const idx = roomUsers.findIndex(({ id }) => id === socket.id);
    if (idx >= 0) {
      roomUsers.splice(idx, 1);
      io.emit('roomUpdated', listUsers());
    }
  });
});

console.log('Socket.io server running');

/**
 * The function used to locate the user's socket and exchange signals
 * @param {SocketIO.Socket} socket - The socket where exchanges are happening
 * @param {object} messages - The messages exchanged for the signaling 
 */
function signalExchange(socket, { to, data }) {
  const callee = roomUsers.find(({ name }) => name === to);
  const caller = roomUsers.find(({ id }) => id === socket.id);

  socket.broadcast.to(callee.id).emit('call', { from: caller.name, data });
}

/**
 * Adds a user to the room
 * @param {string} id 
 * @param {string} name 
 */
function addUser(id, name) {
  roomUsers.push({ id, name });
}

/**
 * Return the names of the users currently in the room
 * @returns {string[]}
 */
function listUsers() {
  return roomUsers.map(({ name }) => name);
}