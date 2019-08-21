const { RTCVideoSource, RTCAudioSource } = require('wrtc').nonstandard;
const { MediaStream } = require('wrtc');
const FfmpegCommand = require('fluent-ffmpeg');
const { spawn, exec } = require('child_process');

const Yuv420pParser = require('./yuv420pParser');
const AudioParser = require('./audioParser');

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

function dbus(env) {
  const args = [
    'dbus-daemon',
    '--nofork',
    '--config-file=/usr/share/dbus-1/system.conf'
  ];
  const opts = {
    env,
    stdio: [
      'ignore',
      'inherit',
      'inherit'
    ]
  };
  return spawn('sudo', args, opts);
}

function pulseaudio(env) {
  return pa = exec('DISPLAY=:100 start-pulseaudio', (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    if(err) console.error(err);
  });
}

function ffmpeg(env, width, height) {
  const vidArgs = [
    '-s', `${width}x${height}`,
    '-r', '30',
    '-f', 'x11grab',
    '-i', env.DISPLAY,

    '-vf', 'format=yuv420p',
    '-f', 'rawvideo',
    '-an',
    'pipe:1'
  ];
  
  const audArgs = [
    '-f', 'pulse',
    '-ac', '2',
    '-i', 'default',

    '-f', 's16le',
    '-vn',
    '-af', 'aresample=async=1',
    '-ac', '2',
    '-r', '48000',
    'pipe:1'
  ];
  const vidOpts = {
    env,
    stdio: [
      'ignore',
      'pipe',
      'inherit',
    ]
  };
  const audOpts = {
    env,
    stdio: [
      'ignore',
      'pipe',
      'ignore',
    ]
  };
  const vidPipe = spawn('ffmpeg', vidArgs, vidOpts).stdout;
  const audPipe = spawn('ffmpeg', audArgs, audOpts).stdout;
  return [vidPipe, audPipe];
}

function init() {
  dbus(this.env);
  xvfb(this.env, this.width, this.height, this.bitDepth);
  pulseaudio(this.env);
  openbox(this.env);
  firefox(this.env, this.width, this.height);
  this.xdoin = xdotool(this.env).stdin;
  const [vidPipe, audPipe] = ffmpeg(this.env, this.width, this.height);
  vidPipe.pipe(this.yuv420p);
  audPipe.pipe(this.audioParser);
  /*command
    .input(this.env.DISPLAY)
    .inputFps(30)
    .inputFormat('x11grab')
    .inputOptions('-s 1920x1080')
    
    .input('default')
    .inputFormat('pulse')
    .audioChannels(2)
    
    .output(this.yuv420p)
    .format('rawvideo')
    .videoFilter({
      filter: 'format',
      options: 'yuv420p'
    })
    .output(this.audioParser)
    .outputOptions('-ac 2')
    .format('s16be')

  command.run();*/

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
    const vidSource = new RTCVideoSource();
    const audSource = new RTCAudioSource();
    const vidTrack = vidSource.createTrack();
    const audTrack = audSource.createTrack();
    const videoFrame = { width, height, data: null };
    const audioData = { sampleRate: 48000, channelCount: 2, samples: null };

    this.width = width;
    this.height = height;
    this.bitDepth = bitDepth;
    this.env = Object.assign({}, process.env, {DISPLAY: disp});

    this.yuv420p = new Yuv420pParser(width * height * 1.5, 4);
    this.yuv420p.onFrame = (data) => {
      videoFrame.data = data;
      vidSource.onFrame(videoFrame);
    }
    this.yuv420p.onClose = () => {
      vidTrack.stop();
    };

    this.audioParser = new AudioParser(16, audioData.sampleRate, audioData.channelCount, 4*3);
    this.audioParser.onFrame =(samples) => {
      audioData.samples=samples;
      audSource.onData({...audioData});
    };

    this.mediaStream = new MediaStream([vidTrack, audTrack]);
    init.call(this);
  }
}

module.exports = VirtualBrowser;