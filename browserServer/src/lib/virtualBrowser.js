const { RTCVideoSource } = require('wrtc').nonstandard;
const { MediaStream } = require('wrtc');
const FfmpegCommand = require('fluent-ffmpeg');
const { spawn } = require('child_process');

const Yuv420pParser = require('./yuv420pParser');

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

function xvfb(env, width, height, bd) {
  const args = [
    env.DISPLAY,
    '-ac',
    '-screen', '0', `${width}x${height}x${bd}`
  ];
  const opts = {
    stdio: [
      'ignore',
      'inherit',
      'inherit'
    ]
  };
  return spawn('Xvfb', args, opts);
}

function openbox(env) {
  const args = [];
  const opts = {
    env,
    stdio: [
      'ignore',
      'inherit',
      'inherit'
    ]
  };
  return spawn('openbox', args, opts);
}

function firefox(env, width, height) {
  const args = [
    '-width', width,
    '-height', height,
    'https://www.youtube.com/'
  ];
  const opts = {
    env,
    stdio: [
      'ignore',
      'inherit',
      'inherit'
    ]
  };
  return spawn('firefox-esr', args, opts);
}

function xdotool(env) {
  const args = [
    '-'
  ];
  const opts = {
    env,
    stdio: [
      'pipe',
      'inherit',
      'inherit'
    ]
  };
  return spawn('xdotool', args, opts);
}



function init() {
  xvfb(this.env, this.width, this.height, this.bitDepth);
  openbox(this.env);
  firefox(this.env, this.width, this.height);
  this.xdoin = xdotool(this.env).stdin;
  const command = new FfmpegCommand();
  command
    .input(this.env.DISPLAY)
    .inputFormat('x11grab')
    .inputOptions('-s 1920x1080')
    .noAudio()
    .fps(30)
    .format('rawvideo')
    .videoFilter({
      filter: 'format',
      options: 'yuv420p'
    })
    .output(this.yuv420p);
  command.run();

  this.input = {
    mouseMove: (x, y) => {
      this.xdoin.write(`mousemove ${x} ${y}\n`);
    },
    mouseDown: (x, y, btn) => {
      this.xdoin.write(`mousemove ${x} ${y}\nmousedown ${btn}\n`);
    },
    mouseUp: (x, y, btn) => {
      this.xdoin.write(`mousemove ${x} ${y}\nmouseup ${btn}\n`);
    },
    keyDown: (key) => {
      console.log(`'${keyRemapper(key).replace(/'/g,'\\\'')}'`)
      this.xdoin.write(`keydown '${keyRemapper(key).replace(/'/g,'\\\'')}'\n`);
    },
    keyUp: (key) => {
      this.xdoin.write(`keyup '${keyRemapper(key).replace(/'/g,'\\\'')}'\n`);
    }
  }
}

class VirtualBrowser {
  constructor(width, height, bitDepth, disp = ':100') {
    const source = new RTCVideoSource();
    const track = source.createTrack();
    const frame = { width, height, data: null };

    this.width = width;
    this.height = height;
    this.bitDepth = bitDepth;
    this.env = Object.assign({}, process.env, {DISPLAY: disp});

    this.yuv420p = new Yuv420pParser(width * height * 1.5, 4);
    this.yuv420p.onFrame = (data) => {
      frame.data = data;
      source.onFrame(frame);
    }
    this.yuv420p.onClose = () => {
      track.stop();
    };
    this.mediaStream = new MediaStream([track]);
    init.call(this);
  }
}

module.exports = VirtualBrowser;