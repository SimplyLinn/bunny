"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ProcessSpawner = _interopRequireDefault(require("./ProcessSpawner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* Spawn processes and perform ipc
*/
class ProcessBus {
  constructor(options = {}) {
    const {
      env = {}
    } = options;
    this._env = { ...process.env,
      ...env
    };
    this.spawners = {};
  }

  get env() {
    return this._env;
  }

  set env(obj) {
    if (typeof obj != 'object' || obj instanceof Array) {
      throw 'Cannot Set Environment';
    }

    this._env = { ...this._env,
      ...obj
    }; // purge undefined keys

    for (let key in this._env) {
      if (typeof this._env[key] === 'undefined') delete this._env[key];
    }
  }
  /**
   * Spawn a process
   * @param {String} id 
   * @param {ProcessSpawner} spawner 
   */


  spawnProcess(id, spawner, args = [], opts = {}) {
    if (!spawner instanceof _ProcessSpawner.default) {
      throw new Error(`Expected ProcessSpawner but received ${spawner}`);
    }

    if (this.spawners[id]) {
      throw new Error(`Process with id: ${id} has already been spawned`);
    }

    this.spawners[id] = spawner;
    return spawner.spawn(this.env, args, opts);
  }
  /**
   * Write to stdinput of a process
   * @param {*} id 
   * @param  {...any} args 
   */


  write(id, ...args) {
    if (!this.spawners[id]) {
      throw new Error(`Process with id: ${id} does not exist`);
    }

    return this.spawners[id].write(...args);
  }

}

exports.default = ProcessBus;