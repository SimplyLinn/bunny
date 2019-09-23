export default class BaseError extends Error {
  constructor(...args) {
    super(...args);
  }
}
Reflect.defineProperty(BaseError.prototype, 'name', {
  enumerable: true,
  get() {return this.constructor.name}
});