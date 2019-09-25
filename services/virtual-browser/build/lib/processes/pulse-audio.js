"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pulseAudio = void 0;

var _ProcessSpawner = _interopRequireDefault(require("../ProcessSpawner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// pulseaudio --system --daemonize --disallow-exit --exit-idle-time=-1 -vvvv --file "./pulse-config.pa"
const pulseAudio = new _ProcessSpawner.default({
  command: 'pulseaudio',
  shell: true,
  timeout: 500,
  errorOnTimeout: false,
  args: ['--system', // '--daemonize',
  '--disallow-exit', '--exit-idle-time=1', '--file=/bin/pulse-config.pa', '-vv'],
  output: {
    data(proc, data) {
      this.log(data.toString());
    }

  },
  error: {
    data(proc, data) {
      const str = data.toString().split(/\n/).forEach(line => {
        // filter out warnings and info
        if (/^E:/.test(line)) {
          return this.err(line);
        }

        this.log(line);
      });
    }

  }
});
exports.pulseAudio = pulseAudio;