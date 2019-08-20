const conf = require('./conf');
const VirtualBrowser = require('./lib/virtualBrowser');
const WrtcClient = require('./lib/wrtcClient');

const virtualBrowser = new VirtualBrowser(+conf.width, +conf.height, +conf.bit_depth);
new WrtcClient(conf.signal_server, virtualBrowser)


