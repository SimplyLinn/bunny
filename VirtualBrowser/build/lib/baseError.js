"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class BaseError extends Error {
  constructor(...args) {
    super(...args);
  }

}

exports.default = BaseError;
Reflect.defineProperty(BaseError.prototype, 'name', {
  enumerable: true,

  get() {
    return this.constructor.name;
  }

});