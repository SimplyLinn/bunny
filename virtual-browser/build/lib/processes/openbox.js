"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openbox = void 0;

var _ProcessSpawner = _interopRequireDefault(require("../ProcessSpawner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const openbox = new _ProcessSpawner.default({
  command: 'openbox',
  shell: true,
  timeout: 500,
  errorOnTimeout: false,
  opts: env => ({
    env: {
      DISPLAY: `:${env.DISPLAY}`
    }
  }),
  output: {
    data(proc, data) {
      // TODO: Check if error and reject
      this.log(data.toString());
    }

  },
  error: {
    data(proc, data) {
      this.err(data.toString());
    }

  }
});
exports.openbox = openbox;