const argv = require('argv-parse');
const args = argv({
  width: {
    type: 'string',
    alias: 'w'
  },
  height: {
    type: 'string',
    alias: 'h'
  },
  bit_depth: {
    type: 'string',
    alias: 'bd'
  },
  signal_server: {
    type: 'string',
    alias: 's'
  },
  firefox_args: {
    type: 'string'
  },
  secret: {
    type: 'string'
  }
});
console.log(process.argv);
console.log(args);
const defaults = {
  width: '1920',
  height: '1080',
  bit_depth: '24',
  signal_server: 'ws://bunn.is',
  firefox_args: ''
};

module.exports = Object.assign({}, defaults, args);