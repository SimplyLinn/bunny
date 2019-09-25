import { Writable } from 'stream'

export default class Yuv420pParser extends Writable {
  constructor(frameSize, frames) {
    super();
    /**
     * @type {Array<Uint8Array>}
     */
    this.frames = [];
    this.frameSize = frameSize;
    for(let i = 0; i < frames; i++) {
      this.frames.push(new Uint8Array(frameSize));
    }
    this.curFramePos = 0;
    this.curFrame = 0;
    this.curFrameArr = this.frames[this.curFrame];
    this.onFrame = ()=>{};
    this.onClose = ()=>{};
  }

  /**
   * 
   * @param {Buffer} chunk  
   * @param {(err?:Error)=>void} callback 
   */
  _write(chunk, _, callback) {
    if(chunk.length+this.curFramePos > this.frameSize) {
      const curFrameArr = this.curFrameArr;
      const remainingBytes = this.frameSize-this.curFramePos;
      curFrameArr.set(chunk.slice(0,remainingBytes), this.curFramePos);
      this.curFramePos = 0;
      this.curFrame = (this.curFrame+1) % this.frames.length;
      this.curFrameArr = this.frames[this.curFrame];
      this.onFrame(curFrameArr);
      return this._write(chunk.slice(remainingBytes), _, callback);
    }
    this.curFrameArr.set(chunk, this.curFramePos);
    this.curFramePos += chunk.length;
    callback();
  }

  _final() {
    this.onClose();
  }
}