"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _wrtc = require("wrtc");

var _fluentFfmpeg = _interopRequireDefault(require("fluent-ffmpeg"));

var _child_process = require("child_process");

var _yuv420pParser = _interopRequireDefault(require("./yuv420pParser"));

var _audioParser = _interopRequireDefault(require("./audioParser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  RTCVideoSource,
  RTCAudioSource
} = _wrtc.nonstandard;

function keyRemapper(key) {
  switch (key) {
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

const createProcessSpawner = (command, genArgs, genOpts) => (bus, args, opts) => {
  const process = (0, _child_process.spawn)(command, genArgs(bus.env, args), genOpts(bus.env, opts));
  process.addListener('close', (code, signal) => bus.onEvent('close', code, signal));
  process.addListener('disconnect', (code, signal) => bus.onEvent('disconnect', code, signal));
  process.addListener('error', (code, signal) => bus.onEvent('error', code, signal));
  process.addListener('exit', (code, signal) => bus.onEvent('exit', code, signal));
  process.addListener('message', (code, signal) => bus.onEvent('message', code, signal));
  return process;
};

const spawnXvfb = createProcessSpawner('Xvfb', (env, {
  width,
  height,
  bd
}) => [env.DISPLAY, '-ac', '-screen', '0', `${width}x${height}x${bd}`], () => ({
  stdio: ['ignore', 'inherit', 'inherit']
}));

function xvfb(env, width, height, bd) {
  const args = [env.DISPLAY, '-ac', '-screen', '0', `${width}x${height}x${bd}`];
  const opts = {
    stdio: ['ignore', 'inherit', 'inherit']
  };
  return (0, _child_process.spawn)('Xvfb', args, opts);
}

function openbox(env) {
  const args = [];
  const opts = {
    env,
    stdio: ['ignore', 'inherit', 'inherit']
  };
  return (0, _child_process.spawn)('openbox', args, opts);
}

function firefox(env, width, height) {
  const args = ['-width', width, '-height', height, 'https://www.youtube.com/'];
  const opts = {
    env,
    stdio: ['ignore', 'inherit', 'inherit']
  };
  return (0, _child_process.spawn)('firefox-esr', args, opts);
}

function xdotool(env) {
  const args = ['-'];
  const opts = {
    env,
    stdio: ['pipe', 'inherit', 'inherit']
  };
  return (0, _child_process.spawn)('xdotool', args, opts);
}

function dbus(env) {
  const args = ['dbus-daemon', '--nofork', '--config-file=/usr/share/dbus-1/system.conf'];
  const opts = {
    env,
    stdio: ['ignore', 'inherit', 'inherit']
  };
  return (0, _child_process.spawn)('sudo', args, opts);
}

function pulseaudio(env) {
  return (0, _child_process.exec)('DISPLAY=:100 start-pulseaudio', (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    if (err) console.error(err);
  });
}

function ffmpeg(env, width, height) {
  const vidArgs = ['-s', `${width}x${height}`, '-r', '30', '-f', 'x11grab', '-i', env.DISPLAY, '-vf', 'format=yuv420p', '-f', 'rawvideo', '-an', 'pipe:1'];
  const audArgs = ['-f', 'pulse', '-ac', '2', '-i', 'default', '-f', 's16le', '-vn', '-af', 'aresample=async=1', '-ac', '2', '-ar', '44100', 'pipe:1'];
  const vidOpts = {
    env,
    stdio: ['ignore', 'pipe', 'ignore']
  };
  const audOpts = {
    env,
    stdio: ['ignore', 'pipe', 'inherit']
  };
  const vidPipe = (0, _child_process.spawn)('ffmpeg', vidArgs, vidOpts).stdout;
  const audPipe = (0, _child_process.spawn)('ffmpeg', audArgs, audOpts).stdout;
  return [vidPipe, audPipe];
}

class VirtualBrowser {
  constructor({
    width,
    height,
    bitDepth,
    disp = ':100'
  }) {
    let a = 1;
    console.log(++a);
    const vidSource = new RTCVideoSource();
    this.vidTrack = vidSource.createTrack();
    const videoFrame = {
      width,
      height,
      data: null
    };
    const audioData = {
      sampleRate: 44100,
      channelCount: 2,
      samples: null
    };
    this.audSources = new Set();
    this.width = width;
    this.height = height;
    this.bitDepth = bitDepth;
    this.env = { ...process.env,
      DISPLAY: disp
    };
    console.log(++a);
    this.yuv420p = new _yuv420pParser.default(width * height * 1.5, 4);

    this.yuv420p.onFrame = data => {
      videoFrame.data = data;
      vidSource.onFrame(videoFrame);
    };

    this.yuv420p.onClose = () => {
      this.vidTrack.stop();
    };

    console.log(++a);
    this.audioParser = new _audioParser.default(16, audioData.sampleRate, audioData.channelCount, 4 * 3);

    this.audioParser.onFrame = samples => {
      audioData.samples = samples;
      this.audSources.forEach(audSource => audSource.onData({ ...audioData
      }));
    }; //this.stream = new MediaStream([vidTrack, audTrack]);
    //this.vidStream = new MediaStream([vidTrack]);
    //this.audStream = new MediaStream([audTrack]);


    this.init();
  }

  onEvent(...args) {
    console.log(...args);
  }

  init() {
    console.log('Initializing');
    dbus(this.env);
    spawnXvfb(this, {
      width: this.width,
      height: this.height,
      width: this.bitDepth
    });
    pulseaudio(this.env);
    openbox(this.env);
    firefox(this.env, this.width, this.height);
    this.xdoin = xdotool(this.env).stdin;
    const [vidPipe, audPipe] = ffmpeg(this.env, this.width, this.height);
    vidPipe.pipe(this.yuv420p);
    audPipe.pipe(this.audioParser);
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
      keyDown: key => {
        console.log(`'${keyRemapper(key).replace(/'/g, '\\\'')}'`);
        this.xdoin.write(`keydown '${keyRemapper(key).replace(/'/g, '\\\'')}'\n`);
      },
      keyUp: key => {
        this.xdoin.write(`keyup '${keyRemapper(key).replace(/'/g, '\\\'')}'\n`);
      }
    };
  }

  getStream(peer) {
    const audSource = new RTCAudioSource();
    this.audSources.add(audSource);
    const audTrack = audSource.createTrack();
    const ms = new _wrtc.MediaStream([this.vidTrack, audTrack]);
    peer.on('close', () => {
      this.audSources.delete(audSource);
      audTrack.stop();
    });
    return ms;
  }

}

exports.default = VirtualBrowser;