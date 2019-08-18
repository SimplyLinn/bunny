const { RTCVideoSource, RTCVideoSink } = require('wrtc').nonstandard;
const { MediaStream } = require('wrtc');
const FfmpegCommand = require('fluent-ffmpeg');
const { Writable } = require('stream');
const browserStream = require('./browserStream');

class Yuv420pParser extends Writable {
  /**
   * 
   * @param {Uint8Array} buffer 
   */
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

module.exports = () => {
    const source = new RTCVideoSource();
    const track = source.createTrack();

    const width = 1920;
    const height = 1080;
    const frame = { width, height};

    const yuv420p = new Yuv420pParser(width * height * 1.5, 2);
    yuv420p.onFrame = (data) => {
      frame.data = data;
      source.onFrame(frame);
    }
    yuv420p.onClose = () => {
      track.stop();
    };
    /*const command = new FfmpegCommand();
    console.log(command
      .input(':100')
      .inputFormat('x11grab')
      .inputOptions('-s 1920x1080')
      .noAudio()
      .fps(30)
      .format('rawvideo')
      .videoFilter({
        filter: 'format',
        options: 'yuv420p'
      })
      .output(yuv420p));
    command.run();*/
    browserStream(width, height, 16)
    .then(({audio, video}) => {
      console.log('video')
      video.pipe(yuv420p);
    });

    return { stream: new MediaStream([track]) };
};