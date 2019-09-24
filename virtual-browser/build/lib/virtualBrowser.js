"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var wrtc = _interopRequireWildcard(require("wrtc"));

var _yuv420pParser = _interopRequireDefault(require("./yuv420pParser"));

var _audioParser = _interopRequireDefault(require("./audioParser"));

var _ProcessBus = _interopRequireDefault(require("./ProcessBus"));

var _processes = require("./processes");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function keyRemapper(key) {
  switch (key) {
    case ' ':
      key = '0xff80';
      break;

    case 'Backspace':
      key = '0xff08';
      break;

    case 'Enter':
      key = '0xff8d';
      break;

    case '.':
      key = '0x002e';
      break;

    case '!':
      key = '0x0021';
      break;

    case ',':
      key = '0x002c';
      break;

    default:
      key = key;
      break;
  }

  return key.replace(/'/, `\'`); // maybe double backslash
} // function ffmpeg_old(env, width, height) {
//   const vidPipe = spawn('ffmpeg', vidArgs, vidOpts).stdout;
//   const audPipe = spawn('ffmpeg', audArgs, audOpts).stdout;
//   return [vidPipe, audPipe];
// }

/**
 * Controls all of the necessary elements in order to display and 
 * interact with the virtual browser on the system.
 */


class VirtualBrowser extends _ProcessBus.default {
  constructor(options = {}) {
    super(options);
    const {
      width = 1080,
      height = 720,
      bitDepth = 24,
      display = 20
    } = options;
    this.width = width;
    this.height = height;
    this.bitDepth = bitDepth;
    this.display = display;
    this.inputStreamIsInitialized = false;
    this.env = {
      DISPLAY: display
    };

    this._createSources();
  }

  _createSources() {
    // This next line closes the program without throwing an error on alpine
    const videoFrame = {
      width: this.width,
      height: this.height,
      data: null
    };
    const audioData = {
      sampleRate: 44100,
      channelCount: 2,
      samples: null
    };
    const vidSource = new wrtc.nonstandard.RTCVideoSource();
    const vidTrack = vidSource.createTrack();
    this.audSources = new Set();
    this.yuv420p = new _yuv420pParser.default(this.width * this.height * 1.5, 4);

    this.yuv420p.onFrame = data => {
      videoFrame.data = data;
      vidSource.onFrame(videoFrame);
    };

    this.yuv420p.onClose = () => {
      vidTrack.stop();
    };

    this.audioParser = new _audioParser.default(16, audioData.sampleRate, audioData.channelCount, 4 * 3);

    this.audioParser.onFrame = samples => {
      audioData.samples = samples;
      this.audSources.forEach(audSource => audSource.onData({ ...audioData
      }));
    };
  }

  async init() {
    // Be careful about race conditions here
    await this.spawnProcess('dbus', _processes.dbus);
    await this.spawnProcess('xvfb', _processes.xvfb, [this.width, this.height, this.bitDepth]); // Should be possible to launch the following in parallel 

    await this.spawnProcess('openbox', _processes.openbox); // await this.spawnProcess('pulse-audio', pulseAudio, [this.env.DISPLAY])

    await this.spawnProcess('firefox', _processes.firefox, [this.width, this.height]); // firefox(this.env, this.width, this.height);
    // this.xdoin = xdotool(this.env).stdin;

    await this.spawnProcess('xdotool', _processes.xdotool);
    this.inputStreamIsInitialized = true;
    await this.spawnProcess('ffmpeg-video', _processes.ffmpeg.video, [this.width, this.height]); // await this.spawnProcess('ffmpeg-audio', ffmpeg.audio)
    // const [vidPipe, audPipe] = ffmpeg(this.env, this.width, this.height);
    // vidPipe.pipe(this.yuv420p);
    // audPipe.pipe(this.audioParser);
  }

  mouseMove(x, y) {
    this.writeCommand(`mousemove ${x} ${y}`);
  }

  mouseDown(x, y, btn) {
    this.mouseMove(x, y);
    this.writeCommand(`mousedown ${btn}`);
  }

  mouseUp(x, y, btn) {
    this.mouseMove(x, y);
    this.writeCommand(`mouseup ${btn}`);
  }

  keyDown(key) {
    const mappedKey = keyRemapper(key);
    this.writeCommand(`keydown ${mappedKey}`);
  }

  keyUp(key) {
    const mappedKey = keyRemapper(key);
    this.writeCommand(`keyup ${mappedKey}`);
  }

  toggleInput(bool) {
    this.ignoreInput = typeof bool === 'boolean' ? !bool : !this.ignoreInput;
  }

  writeCommand(command) {
    // write to xdotool.stdin (add newline to the end too)
    if (!this.inputStreamIsInitialized) {
      console.warn(`Warning: xdotool input stream not initialized. Commands will be ignored`);
      this.ignoreInput = true;
    }

    if (this.ignoreInput) return;

    this._input.write(`${command}\n`); // or maybe
    // xdotool.write('<id>', `${command}\n`)

  }
  /**
   * Get a stream for a peer(?)
   * @param {*} peer 
   */


  getStream(peer) {
    const audSource = new wrtc.nonstandard.RTCAudioSource();
    this.audSources.add(audSource);
    const audTrack = audSource.createTrack();
    const ms = new wrtc.MediaStream([this.vidTrack, audTrack]);
    peer.on('close', () => {
      this.audSources.delete(audSource);
      audTrack.stop();
    });
    return ms;
  }

  close() {// Cleanup and shut down
  }

}

exports.default = VirtualBrowser;