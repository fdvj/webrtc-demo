
const io = require('socket.io-client');
const Call = require('./lib/call');
const { renderUserList } = require('./lib/userList');

// Keeps track of the clients currently connected to the lobby
let clients = [];

// Holds the username used to identify oneself in the room
let user;

// Holds the peer 2 peer call connection
let currentCall;

///////////////////////////////////////////////////////////

/**
 * Signaling server operations
 * These are done via socket.io
 */

// Established our connection to the signaling server (Socket.io)
const socket = io('https://signal.fernandodevega.net:443');

// Open the connection to the lobby
socket.on('roomUpdated', (users) => {
  clients = users;
  renderUserList(document.getElementById('user-list'), users, user, onCallClick);
});

socket.on('call', async ({ from, data: offer }) => {
  // If there is no current call happening, ring first
  if (!currentCall) {
    // Locate Call button to disable
    const button = document.querySelector(`button[value="${from}"]`);
    button.disabled = true;

    const answer = confirm(`${from} is calling. Do you want to answer?`);
    if (!answer) {
      button.disabled = false;
      return;
    }
    currentCall = new Call(
      document.getElementById('user-video'),
      document.getElementById('peer-video'),
      (data) => socket.emit('answer', { to: from, data })
    );
  }

  currentCall.answer(offer);
});

socket.on('answer', ({ data }) => {
  currentCall.answer(data);
});

///////////////////////////////////////////////////////////

/**
 * Document Event Listeners and their functions.
 * They are placed separate so that we can remove the event listener 
 * when removing from the DOM
 */

/**
 * The Call button event listener
 * @param {EventListenerObject} evt - The event triggered
 */
async function onCallClick(evt) {
  // Disable the button to prevent trigger happy fingers
  evt.target.disabled = true;

  // Setup the call object
  currentCall = new Call(
    document.getElementById('user-video'),
    document.getElementById('peer-video'),
    (data) => socket.emit('call', { to: evt.target.value, data })
  );
  

  // Execute the call
  currentCall.make();
}

/**
 * The Join button eventlisterner
 * @param {EventListenerObject} evt - The event triggered
 */
function onJoinClick(evt) {
  const username = prompt('What will be your username?');
  if (!username || !username.trim()) {
    return alert('Sorry, you cannot join without a username');
  }

  if (clients.includes(username.toLowerCase().trim())) {
    return alert('Sorry, that username has already been taken');
  }

  socket.emit('join', username);
  evt.target.removeEventListener('click', onJoinClick);
  document.getElementById('join').remove();
  user = username;
}

document.getElementById('join').addEventListener('click', onJoinClick);
