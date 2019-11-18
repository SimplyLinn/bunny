<template>
  <div class="about">
    <video id="remoteVideo" :class="{focus:vidFocus}" ref="video" autoplay></video>
    <textarea id="dummyInput" ref="input" style="position: absolute; left: -9999px"></textarea>
    <button type="button" @click="resync">Resync audio/video</button>
  </div>
</template>

<script>

import Peer from 'simple-peer';
import Keyboard from '@/utils/keyboard';
import InstructionBuffer from '@/utils/instructionBuffer';
import opCodes from '@/utils/opCodes';

function prepareVideoListeners() {
  const { video } = this.$refs;
  video.addEventListener('mousedown', this.videoListeners.mousedown = e => {
    if(!this.vidFocus) return false;
    const inst = new InstructionBuffer(opCodes.MOUSE_BTN_DWN, 1);
    inst.writeUint8(e.button+1);
    this.sendCommand(inst.arrayBuffer);
    e.preventDefault();
    e.stopPropagation();
  });
  video.addEventListener('mouseup', this.videoListeners.mouseup = e => {
    if(!this.vidFocus) return false;
    const inst = new InstructionBuffer(opCodes.MOUSE_BTN_UP, 1);
    inst.writeUint8(e.button+1);
    this.sendCommand(inst.arrayBuffer);
    e.preventDefault();
    e.stopPropagation();
  });
  video.addEventListener('contextmenu', this.videoListeners.contextmenu = e => {
    if(this.vidFocus) e.preventDefault();
  });
  video.addEventListener('click', this.videoListeners.click = e => {
    const inst = new InstructionBuffer(opCodes.REQUEST_CONTROL, 0);
    this.sendCommand(inst.arrayBuffer);
    e.preventDefault();
    e.stopPropagation();
  });
  video.addEventListener('mousemove', this.videoListeners.mousemove = e => {
    if(!this.vidFocus) return false;
    const rect = video.getBoundingClientRect();
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const x = (e.clientX - rect.left) / width;
    const y = (e.clientY - rect.top) / height;
    const inst = new InstructionBuffer(opCodes.MOUSE_MOVE, 4);
    inst.writeUint16(Math.min(Math.round(x * 0xFFFF), 0xFFFF));
    inst.writeUint16(Math.min(Math.round(y * 0xFFFF), 0xFFFF));
    this.sendCommand(inst.arrayBuffer);
    e.preventDefault();
  });
  video.addEventListener('wheel', this.videoListeners.wheel = e => {
    if(!this.vidFocus) return false;
    const ydir = Math.sign(e.deltaY);
    const xdir = Math.sign(e.deltaX)
    if(!xdir && !ydir || (xdir && ydir)) return;
    let btn;
    if(ydir && ydir < 0) btn = 4; 
    if(ydir && ydir > 0) btn = 5;
    if(xdir && xdir < 0) btn = 6;
    if(xdir && xdir > 0) btn = 7;
    const inst = new InstructionBuffer(opCodes.MOUSE_BTN_CLK, 1);
    inst.writeUint8(btn);
    this.sendCommand(inst.arrayBuffer);
    e.preventDefault();
  });
}

function prepareKeyboardListeners() {
  const { input } = this.$refs;
  const keyboard = new Keyboard(input);
  keyboard.onkeydown = (key) => {
    if(!this.vidFocus) return false;
    const inst = new InstructionBuffer(opCodes.KEY_DOWN, 2);
    inst.writeUint16(key);
    this.sendCommand(inst.arrayBuffer);
  };
  keyboard.onkeyup =  (key) => {
    if(!this.vidFocus) return false;
    const inst = new InstructionBuffer(opCodes.KEY_UP, 2);
    inst.writeUint16(key);
    this.sendCommand(inst.arrayBuffer);
  };
  this.keyboard = keyboard;
}

export default {
  data: ()=>({
    wsServer: null,
    playTimer: null,
    unfocusListener: null,
    vidFocus: false,
    videoListeners: {},
    keyboard: null,
    peers: new Map,
    streamPeer: null,
  }),
  mounted() {
    this.wsServer = new WebSocket('wss://' + window.location.hostname + ':8443');
    this.wsServer.onmessage = (data) => this.gotMessageFromServer(data);
    this.wsServer.onopen = () => {
      console.log('websocket established');
    };
    this.playTimer = setInterval(()=>{
      const { video } = this.$refs;
      if(video.paused) video.play();
    }, 1000);
    this.unfocusListener = e => {
      const inst = new InstructionBuffer(opCodes.RELEASE_CONTROL, 0);
      this.sendCommand(inst.arrayBuffer);
    };
    document.addEventListener('mousedown', this.unfocusListener);
    prepareVideoListeners.call(this);
    prepareKeyboardListeners.call(this);
  },
  beforeDestroy() {
    const { video } = this.$refs;
    if(this.playTimer !== null) clearInterval(this.playTimer);
    document.removeEventListener('mousedown', this.unfocusListener);
    for([event, listener] of Object.entries(this.videoListeners)) {
      element.removeEventListener(event, listener, false);
    }
    this.keyboard.detach();
  },
  methods: {
    sendWs(obj) {
      console.log('WS-OUT', obj);
      this.wsServer.send(JSON.stringify(obj));
    },
    sendCommand(buf) {
      const { streamPeer } = this;
      if(streamPeer) streamPeer.send(buf);
    },
    createPeer(msg, initiator) {
      const newPeer = new Peer({ initiator });
      newPeer.cid = msg.cid;
      this.peers.set(newPeer.cid, newPeer);
      newPeer.on('error', (err) => {
        console.log('PEER ERROR', err);
      });
      newPeer.on('close', () => peers.delete(newPeer.cid));
      newPeer.on('signal', signal => {
        this.sendWs({
          type: 'signal',
          target: newPeer.cid,
          signal
        });
      });
      newPeer.on('stream', stream => {
        const { video } = this.$refs;
        this.streamPeer = newPeer;
        // got remote video stream, now let's show it in a video tag
        if ('srcObject' in video) {
          video.srcObject = stream;
        } else {
          video.src = window.URL.createObjectURL(stream) // for older browsers
        }
        newPeer.on('data', (data) => {
          data = new DataView(data.buffer);
          const op = data.getUint8(0);
          const size = data.getUint16(0);
          if(op === opCodes.RELEASE_CONTROL) {
            this.vidFocus = false;
            this.$refs.input.blur();
          } else if (op === opCodes.REQUEST_CONTROL) {
            const { input } = this.$refs;
            this.vidFocus = true;
            input.focus();
          }
        });
      })
      return newPeer;
    },
    resync() {
      const inst = new InstructionBuffer(opCodes.RESYNC, 0);
      this.sendCommand(inst.arrayBuffer);
    },
    processSignal(data) {
      if(this.peers.has(data.cid)) return this.peers.get(data.cid).signal(data.signal);
      const newPeer = this.createPeer(data, false);
      newPeer.signal(data.signal);
    },
    gotMessageFromServer(message) {
        const data = JSON.parse(message.data);
        console.log('WS-IN', data);
        switch (data.type) {
          case 'announce':
            this.createPeer(data, true);
            break;
          case 'signal':
            this.processSignal(data);
        }
    }
  }
}
</script>