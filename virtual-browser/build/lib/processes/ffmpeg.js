"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ffmpeg = void 0;

var _ProcessSpawner = _interopRequireDefault(require("../ProcessSpawner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ffmpeg = {
  video: new _ProcessSpawner.default({
    command: 'ffmpeg',
    shell: true,
    timeout: 500,
    errorOnTimeout: false,
    args: (env, [width, height]) => ['-s', `${width}x${height}`, '-r', '30', '-f', 'x11grab', '-i', `:${env.DISPLAY}`, '-vf', 'format=yuv420p', '-f', 'rawvideo', '-an', 'pipe:1'],
    input: 'ignore',
    output: 'pipe',
    error: {
      data(proc, data) {
        this.log(data.toString());
      }

    }
  }),
  audio: new _ProcessSpawner.default({
    command: 'ffmpeg',
    shell: true,
    args: ['-f', 'pulse', '-ac', '2', '-i', 'default', '-f', 's16le', '-vn', '-af', 'aresample=async=1', '-ac', '2', '-ar', '44100', 'pipe:1'],
    output: {
      data(proc, data) {
        this.log(data.toString());
      }

    },
    error: {
      data(proc, data) {
        this.log(data.toString());
      }

    }
  })
};
exports.ffmpeg = ffmpeg;