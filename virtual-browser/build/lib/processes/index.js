"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dbus = require("./dbus");

Object.keys(_dbus).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _dbus[key];
    }
  });
});

var _xvfb = require("./xvfb");

Object.keys(_xvfb).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _xvfb[key];
    }
  });
});

var _firefox = require("./firefox");

Object.keys(_firefox).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _firefox[key];
    }
  });
});

var _pulseAudio = require("./pulse-audio");

Object.keys(_pulseAudio).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _pulseAudio[key];
    }
  });
});

var _openbox = require("./openbox");

Object.keys(_openbox).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _openbox[key];
    }
  });
});

var _ffmpeg = require("./ffmpeg");

Object.keys(_ffmpeg).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ffmpeg[key];
    }
  });
});

var _xdotool = require("./xdotool");

Object.keys(_xdotool).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _xdotool[key];
    }
  });
});