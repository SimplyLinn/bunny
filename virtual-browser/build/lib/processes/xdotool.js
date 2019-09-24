"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.xdotool = void 0;

var _ProcessSpawner = _interopRequireDefault(require("../ProcessSpawner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const xdotool = new _ProcessSpawner.default({
  command: 'xdotool',
  shell: true,
  timeout: 500,
  errorOnTimeout: false,
  opts: env => ({
    env: {
      DISPLAY: `:${env.DISPLAY}`
    }
  }),
  input: 'pipe',
  output: {
    data(proc, data) {
      this.log(data.toString());
    }

  },
  error: {
    data(proc, data) {
      this.err(data.toString());
    }

  },
  args: ['-']
});
exports.xdotool = xdotool;