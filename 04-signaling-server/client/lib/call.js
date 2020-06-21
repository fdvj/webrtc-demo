const Peer = require('simple-peer');

// Holds the user's video stream if any
let mediaStream;

class Call {
  constructor(userVideo, peerVideo, channel) {
    this.stream = mediaStream;
    this.userVideo = userVideo;
    this.peerVideo = peerVideo;
    this.channel = channel;
  }

  /**
   * Establishes a peer to peer connection with a client at the other end of the channel
   */
  make() {
    try {
      // Open 
      this.peer = new Peer({
        initiator: true,
        stream: this.stream,
        config: {
          iceServers: [{ 
            url: 'stun:stun.l.google.com:19302' 
          }, {
            url: 'turn:turn.fernandodevega.net:3478',
            username: 'fercho',
            credential: 'turn'
          }]
        }
      });

      this.peer.on('signal', this.channel);

      // Initialize stream listener if there is video stream
      this._enableVideo();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * When an offer is accepted, this handles the response and establishes the connection
   * @param {Object} data - The Answer and candidates sent back by the other peer
   */
  answer(data) {
    if (!this.peer) {
      this.peer = new Peer({
        stream: mediaStream,
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });

      // Initialize stream listener if there is video stream
      this._enableVideo();

      this.peer.on('signal', this.channel);
    }

    // Send connection data to peer
    this.peer.signal(data);
  }

  _enableVideo() {
    if (this.stream) {
      // Start local video
      this.userVideo.srcObject = this.stream;
      this.userVideo.play();

      // Create reference for closure below
      const peerVideo = this.peerVideo;

      // Wait for the stream to happen
      this.peer.on('stream', (stream) => {
        // Initialize remote video
        peerVideo.srcObject = stream;
        peerVideo.play();
      });
    }
  }
}

// Immediately acquire the stream
(async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  } catch (e) {
    mediaStream = null;
    console.error(e);
  }

})();

module.exports = Call;