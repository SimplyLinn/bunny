import InstructionBuffer, { opCodes } from './InstructionBuffer'

// TODO: Send updates from instruction buffer periodically(?)
export default class VirtualBrowserController {
  constructor(client){
    this.vbClient = client
  }
  mouseUp(x, y, btn){
    this.vbClient.send(JSON.stringify({
      type : 'mouseUp',
      args : [x, y, btn]
    }))
  }
  mouseDown(x, y, btn){
    this.vbClient.send(JSON.stringify({
      type : 'mouseDown',
      args : [x, y, btn]
    }))
  }
  mouseMove(x, y){
    // if(!vidFocus) return false;
    // const inst = new InstructionBuffer(opCodes.MOUSE_MOVE, 4);
    // inst.writeUint16(x);
    // inst.writeUint16(y);
    this.vbClient.send(JSON.stringify({
      type : 'mouseMove',
      args : [x, y]
    }))
  }
}