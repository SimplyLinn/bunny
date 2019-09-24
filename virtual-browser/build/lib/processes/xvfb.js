"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.xvfb = void 0;

var _ProcessSpawner = _interopRequireDefault(require("../ProcessSpawner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const xvfb = new _ProcessSpawner.default({
  command: 'Xvfb',
  shell: true,
  timeout: 500,
  errorOnTimeout: false,
  args: (env, [width, height, bitDepth]) => [`:${env.DISPLAY}`, '-ac', '-audit', '2', `-screen`, `0 ${width}x${height}x${bitDepth}`],
  output: {
    data(proc, data) {
      this.log(data.toString());
    }

  },
  error: {
    // Xvfb outputs successful connections to stderr for some reason
    data(proc, data) {
      const str = data.toString();

      if (/client \d+ connected/.test(str)) {
        return this.log(str);
      }

      return this.err(str);
    }

  }
});
exports.xvfb = xvfb;