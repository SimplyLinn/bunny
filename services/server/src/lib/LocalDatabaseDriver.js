const low = require('lowdb')
const session = require('express-session')
const fileAsync = require('lowdb/adapters/FileAsync')
const StorageDriver = require('./StorageDriver')

module.exports = class LocalDatabaseDriver extends StorageDriver {
  constructor(...args){
    super(...args)
  }

  async init(options={}){
    const {
      location = `${process.cwd()}/.db.json`
    } = options
    this.db = await low(new fileAsync(location))
    this.db.defaults({
      'users' : {},
      'rooms' : {}
    })
  }

  getSessionStore(){
    return new session.MemoryStore()
  }

  find(path, query){
    return this.db.get(path.path.join('.')).find(query).value()
  }

  get(path){
    return this.db.get(path.path.join('.')).value()
  }

  set(path, data){
    return this.db.set(path.path.join('.'), data).write()
  }
}