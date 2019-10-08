import opCodes from './opCodes'
import BaseError from './baseError'
const inControl = null;

class InvalidInstructionError extends BaseError {
  constructor(...args) {
    super(...args);
  }
}
function assertSize(payload, size, maxSize) {
  if(!maxSize) {
    if(payload.length === size) return;
    throw new InvalidInstructionError(`Expected ${size} byte payload, got ${maxSize}`)
  }
  if(payload.length < size || payload.length > maxSize) {
    throw new InvalidInstructionError(`Expected payload to be between ${size} and ${maxSize} bytes, got ${payload.length} bytes`)
  }
}

const instructionRunners = new Map([
  [opCodes.MOUSE_MOVE, function(payload) {
    assertSize(payload, 4);
    const x = payload.readUInt16BE(0);
    const y = payload.readUInt16BE(2);
    return [x,y]
  }],
  [opCodes.MOUSE_BTN_DWN, function(payload) {
    assertSize(payload, 1);
    const btn = payload.readUInt8(0);
    return btn
  }],
  [opCodes.MOUSE_BTN_UP, function(payload) {
    assertSize(payload, 1);
    const btn = payload.readUInt8(0);
    return btn
  }],
  [opCodes.MOUSE_BTN_CLK, function(payload) {
    assertSize(payload, 1);
    const btn = payload.readUInt8(0);
    return btn
  }],
  [opCodes.KEY_DOWN, function(payload) {
    assertSize(payload, 2);
    const key = payload.readUInt16BE(0);
    return `0x${key.toString(16).padStart(4,'0')}`
  }],
  [opCodes.KEY_UP, function(payload) {
    assertSize(payload, 2);
    const key = payload.readUInt16BE(0);
    return `0x${key.toString(16).padStart(4,'0')}`
  }],
])

export default class InstructionReader {
  constructor() {
    this.header = Buffer.allocUnsafe(3);
    this.headerPos = 0;
    this.payloadPos = 0;
    this.payload = null;
    this.size = null;
  }

  /**
   * 
   * @param {Buffer} chunk 
   */
  readHeader(chunk) {
    if(!chunk.length) return chunk;
    switch(this.headerPos) {
      case 0:
        const opCode = chunk.readUInt8(0)
        if(!opCodes.list.has(opCode)) {
          throw new InvalidInstructionError(`Invalid opCode 0x${opCode.toString(16).toUpperCase().padStart(2,'0')}`)
        }
        this.header.writeUInt8(opCode,0)
        this.headerPos++
        return this.readHeader(chunk.slice(1))
      case 1:
        this.header.writeUInt8(chunk.readUInt8(0),1)
        this.headerPos++
        return this.readHeader(chunk.slice(1))
      case 2:
        this.header.writeUInt8(chunk.readUInt8(0),2)
        this.headerPos++
        this.size = this.header.readUInt16BE(1)
        this.payload = new Buffer.allocUnsafe(this.size)
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

  runInstruction (op, payload) {
    try {
      instructionRunners.get(op).call(this, payload);
    } catch (err) {
      console.error(err);
    }
  }
  // TODO: put inside wrtcClient
  onData(chunk) {
    try {
      while(chunk = this.readChunk(chunk));
    } catch (err) {
      if(err instanceof InvalidInstructionError) {
        console.error(err);
        // this.peer.destroy()
      } else {
        throw err;
      }
    }
  }
}