"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.xvfbFirefox = void 0;

var _ProcessSpawner = _interopRequireDefault(require("../ProcessSpawner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const xvfbFirefox = new _ProcessSpawner.default({
  command: 'xvfb-run',
  tag: 'xvfb-firefox',
  shell: true,
  sudo: true,
  timeout: 500,
  // Wait half a second (todo)
  errorOnTimeout: false,
  args: (env, [width, height, bitDepth]) => [// '--auto-servernum',
  '--server-num', env.DISPLAY, '--server-args', `"-screen 0 ${width}x${height}x${bitDepth}"`, 'firefox-esr', '--setDefaultBrowser', '-width', width, '-height', height, 'https://www.youtube.com/'],
  input: 'ignore',
  output: {
    data(proc, chunk) {
      this.log('xvfb-firefox', chunk.toString());
    }

  },
  error: {
    data(proc, chunk) {
      this.err('xvfb-firefox', chunk.toString());
    }

  }
});
exports.xvfbFirefox = xvfbFirefox;