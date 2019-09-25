const StorageDriver = require('./DatabaseDriver')
const low = require('lowdb')
const fileAsync = require('lowdb/adapters/FileAsync')
module.exports = class LocalDatabaseDriver extends StorageDriver {
  async init(options={}){
    const {
      location = `${process.cwd()}/.db.json`
    } = options
    this.db = await low(new fileAsync(location))
    this.db.defaults({
      users : {},
      rooms : {}
    })
  }

  find(path, query){
    return this.db.get(path.path.join('.')).find(query).value()
  }

  get(path){
    console.log('Hello world')
    return this.db.get(path.path.join('.')).value()
  }

  set(path, data){
    return this.db.set(path.path.join('.'), data).write()
  }
}