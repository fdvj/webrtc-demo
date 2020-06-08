const Peer = require('simple-peer');

const peer = new Peer({
  initiator: document.location.hash === '#init',
  trickle: false
});

peer.on('signal', (data) => {
  document.getElementById('caller').value = JSON.stringify(data);
})

document.getElementById('connect').addEventListener('click', () => {
  const callee = JSON.parse(document.getElementById('callee').value);
  peer.signal(callee);
});

document.getElementById('send').addEventListener('click', () => {
  const message = document.getElementById('message').value;
  document.getElementById('messages').appendChild(formatChats('You', message));
  peer.send(message);
});

peer.on('data', (data) => {
  document.getElementById('messages').appendChild(formatChats('Them', data));
});

function formatChats(who, text) {
  const container = document.createElement('div');
  const label = document.createElement('b');
  label.append(`${who}: `);
  container.appendChild(label);
  container.append(text);

  return container;
}