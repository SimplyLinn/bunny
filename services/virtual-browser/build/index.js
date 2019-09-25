"use strict";

var _conf = _interopRequireDefault(require("./conf"));

var _virtualBrowser = _interopRequireDefault(require("./lib/virtualBrowser"));

var _wrtcClient = _interopRequireDefault(require("./lib/wrtcClient"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(async () => {
  const virtualBrowser = new _virtualBrowser.default(_conf.default);
  await virtualBrowser.init();
  console.log('---Virtual Browser Initialized---');
  const wrtcClient = new _wrtcClient.default({
    signalServer: _conf.default.signalServer,
    virtualBrowser
  });
  wrtcClient.init();
  console.log('---WRTC Client Initialized---');
})();