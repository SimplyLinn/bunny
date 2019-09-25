export const opCodes = {
  MOUSE_MOVE: 0x01,
  MOUSE_BTN_DWN: 0x02,
  MOUSE_BTN_UP: 0x03,
  // MOUSE_BTN_DWN: 0x04,
  MOUSE_BTN_CLK: 0x05,
  KEY_DOWN: 0x06,
  KEY_UP: 0x07,
  REQUEST_CONTROL: 0x08,
  RELEASE_CONTROL: 0x09,
  ERROR: 0xFF
}
// TODO: not sure what the following code does yet....
const list = new Set()
for(const key in opCodes) {
  list.add(opCodes[key]);
}
opCodes.list = list


export default class InstructionBuffer {
  constructor(opCode, size) {
    this.arrayBuffer = new ArrayBuffer(size+3);
    this.header = new DataView(this.arrayBuffer, 0, 3);
    this.payload = new DataView(this.arrayBuffer, 3);
    this.pos = 0;
    this.header.setUint8(0, opCode);
    this.header.setUint16(1, this.payload.byteLength);
  }

  writeBigInt64(val, le) {
    this.payload.setBigInt64(this.pos, val, le);
    this.pos += 8;
  }

  writeBigUint64(val, le) {
    this.payload.setBigUint64(this.pos, val, le);
    this.pos += 8;
  }

  writeFloat64(val, le) {
    this.payload.setFloat64(this.pos, val, le);
    this.pos += 8;
  }

  writeFloat32(val, le) {
    this.payload.setFloat32(this.pos, val, le);
    this.pos += 4;
  }

  writeInt32(val, le) {
    this.payload.setInt32(this.pos, val, le);
    this.pos += 4;
  }

  writeInt16(val, le) {
    this.payload.setInt16(this.pos, val, le);
    this.pos += 2;
  }

  writeInt8(val, le) {
    this.payload.setInt8(this.pos, val, le);
    this.pos += 1;
  }

  writeUint32(val, le) {
    this.payload.setUint32(this.pos, val, le);
    this.pos += 4;
  }

  writeUint16(val, le) {
    this.payload.setUint16(this.pos, val, le);
    this.pos += 2;
  }

  writeUint8(val, le) {
    this.payload.setUint8(this.pos, val, le);
    this.pos += 1;
  }
}