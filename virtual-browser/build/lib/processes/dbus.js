"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dbus = void 0;

var _ProcessSpawner = _interopRequireDefault(require("../ProcessSpawner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const dbus = new _ProcessSpawner.default({
  command: 'dbus-daemon',
  sudo: true,
  shell: true,
  args: ['--nofork', '--print-pid', '--config-file=/usr/share/dbus-1/system.conf'],

  resolveOnChunk(chunk) {
    this.log('Testing chunk');
    return /\d+/.test(chunk);
  },

  output: {
    data(proc, data) {
      this.log(data.toString());
    }

  },
  opts: env => ({
    env
  })
});
exports.dbus = dbus;