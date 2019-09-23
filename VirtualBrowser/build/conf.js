"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _commander = _interopRequireDefault(require("commander"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander.default.option('-w, --width <number>', `Width of the browser window`, parseFloat).option('-h, --height <number>', `Height of the browser window`, parseFloat).option('-b, --bit-depth <number>', `Bit depth of the brwoser window`, parseFloat).option('-s, --signal-server <url>', 'URL of signaling server') // .option('--firefox-args <items>', 'Arguments to be passed to firefox instance', v=>v.split(' '))
.option('--secret', '???').parse(process.argv); // const argv = require('argv-parse');
// const args = argv({
//   width: {
//     type: 'string',
//     alias: 'w'
//   },
//   height: {
//     type: 'string',
//     alias: 'h'
//   },
//   bit_depth: {
//     type: 'string',
//     alias: 'bd'
//   },
//   signal_server: {
//     type: 'string',
//     alias: 's'
//   },
//   firefox_args: {
//     type: 'string'
//   },
//   secret: {
//     type: 'string'
//   }
// });


const args = _commander.default.opts();

const defaults = {
  width: 1280,
  height: 720,
  bitDepth: 24,
  signalServer: 'ws://bunn.is',
  firefoxArgs: ''
};
var _default = { ...defaults,
  ...args
};
exports.default = _default;