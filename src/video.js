const { RTCVideoSource, RTCVideoSink } = require('wrtc').nonstandard;
const { MediaStream } = require('wrtc');
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

function keyRemapper(key) {
  switch(key) {
    case ' ':
      return '0xff80';
    case 'Backspace':
      return '0xff08';
    case 'Enter':
      return '0xff8d';
    case '.':
      return '0x002e';
    case '!':
      return '0x0021';
    case ',':
      return '0x002c';
    default:
      return key;
  }
}

module.exports = () => {
    const source = new RTCVideoSource();
    const track = source.createTrack();

    const width = 1920;
    const height = 1080;
    const frame = { width, height};

    const yuv420p = new Yuv420pParser(width * height * 1.5, 4);
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

    const input = {
      mouseMove(){},
      mouseDown(...args){console.log('mouseDown',args)},
      mouseUp(...args){console.log('mouseUp',args)},
      keyDown(){},
      keyUp(){},
      type(){}
    }

    browserStream(width, height, 24)
    .then(({audio, video, xdotool}) => {
      console.log('video')
      video.pipe(yuv420p);
      Object.assign(input, {
        mouseMove(x,y) {
          xdotool.write(`mousemove ${x} ${y} \n`);
        },
        mouseDown(btn=1, x, y) {
          console.log('mouseDownActual',btn,x,y);
          xdotool.write(`mousemove ${x} ${y}\nmousedown ${btn} \n`);
        },
        mouseUp(btn=1, x, y) {
          console.log('mouseUpActual',btn,x,y);
          xdotool.write(`mousemove ${x} ${y}\nmouseup ${btn} \n`);
        },
        keyDown(key) {
          console.log(`'${keyRemapper(key).replace(/'/g,'\\\'')}'`)
          xdotool.write(`keydown '${keyRemapper(key).replace(/'/g,'\\\'')}' \n`);
        },
        keyUp(key) {
          xdotool.write(`keyup '${keyRemapper(key).replace(/'/g,'\\\'')}' \n`);
        }
      });
    });

    return { stream: new MediaStream([track]), input };
};