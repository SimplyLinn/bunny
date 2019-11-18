const opCodes = require('./opCodes');
const BaseError = require('./baseError');
const inControl = null;

class InvalidInstructionError extends BaseError {
  constructor(...args) {
    super(...args);
  }
}
function assertSize(payload, size, maxSize) {
  if(!maxSize) {
    if(payload.length === size) return;
    throw new InvalidInstructionError(`Expected ${size} byte payload, got ${maxSize}`);
  }
  if(payload.length < size || payload.length > maxSize) {
    throw new InvalidInstructionError(`Expected payload to be between ${size} and ${maxSize} bytes, got ${payload.length} bytes`);
  }
}

const mouseBtnDown = new Map();
const keyDown = new Map();
let activeParser = null;

const instructionRunners = new Map([
  [opCodes.MOUSE_MOVE, function(payload) {
    assertSize(payload, 4);
    if(!this.active) return;
    const x = Math.round((payload.readUInt16BE(0) / 0xFFFF) * this.wrtcClient.virtualBrowser.width);
    const y = Math.round((payload.readUInt16BE(2) / 0xFFFF) * this.wrtcClient.virtualBrowser.height);
    //const x = payload.readUInt16BE(0);
    //const y = payload.readUInt16BE(2);
    this.xdoin.write(`mousemove ${x} ${y}\n`);
  }],
  [opCodes.MOUSE_BTN_DWN, function(payload) {
    assertSize(payload, 1);
    if(!this.active) return;
    const btn = payload.readUInt8(0);
    mouseBtnDown.set(btn, (mouseBtnDown.get(btn) || 0) + 1);
    this.xdoin.write(`mousedown ${btn}\n`);
  }],
  [opCodes.MOUSE_BTN_UP, function(payload) {
    assertSize(payload, 1);
    if(!this.active) return;
    const btn = payload.readUInt8(0);
    if ((mouseBtnDown.get(btn) || 0) <= 0) return;
    mouseBtnDown.set(btn, Math.min((mouseBtnDown.get(btn) || 0) - 1, 0));
    this.xdoin.write(`mouseup ${btn}\n`);
  }],
  [opCodes.MOUSE_BTN_CLK, function(payload) {
    assertSize(payload, 1);
    if(!this.active) return;
    const btn = payload.readUInt8(0);
    this.xdoin.write(`click ${btn}\n`);
  }],
  [opCodes.KEY_DOWN, function(payload) {
    assertSize(payload, 2);
    if(!this.active) return;
    const key = payload.readUInt16BE(0);
    keyDown.set(key, (keyDown.get(key) || 0) + 1);
    this.xdoin.write(`keydown 0x${key.toString(16).padStart(4,'0')}\n`);
  }],
  [opCodes.KEY_UP, function(payload) {
    assertSize(payload, 2);
    if(!this.active) return;
    const key = payload.readUInt16BE(0);
    if ((keyDown.get(key) || 0) <= 0) return;
    keyDown.set(key, Math.min((keyDown.get(key) || 0) - 1, 0));
    this.xdoin.write(`keyup 0x${key.toString(16).padStart(4,'0')}\n`);
  }],
  [opCodes.REQUEST_CONTROL, function(payload) {
    assertSize(payload, 0);
    if(activeParser) activeParser.deactivate();
    activeParser = this;
    this.activate();
  }],
  [opCodes.RELEASE_CONTROL, function(payload) {
    assertSize(payload, 0);
    if(!this.active) return;
    this.deactivate();
  }],
  [opCodes.RESYNC, function(payload) {
    assertSize(payload, 0);
    this.resync();
  }],
]);

class InstructionParser {
  constructor(peer, wrtcClient) {
    this.peer = peer;
    this.wrtcClient = wrtcClient;
    this.xdoin = wrtcClient.virtualBrowser.xdoin;
    this.active = false;
  }

  runInstruction (op, payload) {
    try {
      instructionRunners.get(op).call(this, payload);
    } catch (err) {
      console.error(err);
    }
  }

  activate() {
    this.active = true;
    const inst = Buffer.allocUnsafe(3);
    inst.writeUInt8(opCodes.REQUEST_CONTROL, 0);
    inst.writeUInt16BE(0, 1);
    this.peer.send(inst);
  }

  deactivate() {
    this.active = false;
    if(activeParser === this) activeParser = null;
    for(const [btn, count] of mouseBtnDown) {
      for(let i = 0; i < count; i++) this.xdoin.write(`mouseup ${btn}\n`);
    }
    mouseBtnDown.clear();
    for(const [key, count] of keyDown) {
      for(let i = 0; i < count; i++) this.xdoin.write(`keyup 0x${key.toString(16).padStart(4,'0')}\n`);
    }
    keyDown.clear();
    const inst = Buffer.allocUnsafe(3);
    inst.writeUInt8(opCodes.RELEASE_CONTROL, 0);
    inst.writeUInt16BE(0, 1);
    this.peer.send(inst);
  }

  resync() {
    this.wrtcClient.virtualBrowser.addStream(this.peer);
  }
}

class InstructionReader extends InstructionParser {
  constructor(peer, wrtcClient) {
    super(peer, wrtcClient);
    peer.instructionReader = this;
    peer.on('data', (data) => this.onData(data));
    this.header = Buffer.allocUnsafe(3);
    this.headerPos = 0;
    this.payloadPos = 0;
    this.payload = null;
    this.size = null;
    this.active = false;
  }

  /**
   * 
   * @param {Buffer} chunk 
   */
  readHeader(chunk) {
    if(!chunk.length) return chunk;
    switch(this.headerPos) {
      case 0:
        const opCode = chunk.readUInt8(0);
        if(!opCodes.list.has(opCode)) {
          throw new InvalidInstructionError(`Invalid opCode 0x${opCode.toString(16).toUpperCase().padStart(2,'0')}`);
        };
        this.header.writeUInt8(opCode,0);
        this.headerPos++;
        return this.readHeader(chunk.slice(1));
      case 1:
        this.header.writeUInt8(chunk.readUInt8(0),1);
        this.headerPos++;
        return this.readHeader(chunk.slice(1));
      case 2:
        this.header.writeUInt8(chunk.readUInt8(0),2);
        this.headerPos++;
        this.size = this.header.readUInt16BE(1);
        this.payload = new Buffer.allocUnsafe(this.size);
        return chunk.slice(1);
    }
  }
  /**
   * 
   * @param {Buffer} chunk 
   */
  readChunk(chunk) {
    if(this.headerPos !== 3) {
      chunk = this.readHeader(chunk);
      if(!chunk) return;
    }
    const bytesToRead = Math.min(chunk.length, this.size - this.payloadPos);
    if(bytesToRead === chunk.length) {
      chunk.copy(this.payload, this.payloadPos)
      chunk = null;
    } else {
      chunk.copy(this.payload, this.payloadPos, 0, bytesToRead);
      chunk = chunk.slice(bytesToRead);
    }
    this.payloadPos += bytesToRead;
    if(this.payloadPos === this.size) {
      this.headerPos = 0;
      this.payloadPos = 0;
      this.runInstruction(this.header.readUInt8(0), this.payload);
    }
    return chunk;
  }

  

  onData(chunk) {
    try {
      while(chunk = this.readChunk(chunk));
    } catch (err) {
      if(err instanceof InvalidInstructionError) {
        console.error(err);
        this.peer.destroy();
      } else {
        throw err;
      }
    }
  }
}

module.exports = InstructionReader;