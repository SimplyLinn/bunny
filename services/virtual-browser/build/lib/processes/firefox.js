"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.firefox = void 0;

var _ProcessSpawner = _interopRequireDefault(require("../ProcessSpawner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const firefox = new _ProcessSpawner.default({
  command: 'firefox-esr',
  shell: true,
  timeout: 500,
  errorOnTimeout: false,
  args: (env, [width, height]) => [`--display=:${env.DISPLAY}`, '--setDefaultBrowser', '-width', width, '-height', height, 'https://www.youtube.com/'],
  output: {
    data(proc, data) {
      this.log(data.toString());
    }

  },
  error: {
    data(proc, data) {
      this.err(data.toString());
    }

  }
});
exports.firefox = firefox;