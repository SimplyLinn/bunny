/**
 * Very simple QueryBuilder interface
 */
class QueryBuilder {
  constructor(command, driver){
    this.driver = driver
    this.command = command
    this.query = []
  }

  where(key, op, value){
    this.query.push([key, op, value])
    return this
  }

  exec(){
    return this.driver.execQuery(this.command, this.query)
  }
}

/**
 * StorageDriver interface
 * This is inteded to provide a decoupling 
 * of the database services from the needs 
 * of the backend such that in the future
 * a different database can easily be used
 * without the need to change any of the code
 */
module.exports = class StorageDriver {
  /**
   * Generates a path object from a string such as /path/to/obj
   * Can be overriden to generate something more specific
   * @param {String} str 
   */
  createPathObject(str){
    return {
      input : str,
      path : str.replace(/\/+/g,"/").replace(/^\//,"").split('/').filter(Boolean)
    }
  }

  execQuery(command, query){
    this[command](query)
  }

  async init(){
    throw new Error('Not Implemented')
  }

  async find(){
    throw new Error('Not Implemented')
  }
  /**
   * Serializes data into a database using a given path
   * and returns true. Rejects with an error otherwise.
   * @param {*} path 
   * @param {*} data 
   * @returns {Promise<boolean>}
   */
  async set(path, data){
    throw new Error('Not Implemented')
  }
  /**
   * Retrieves data from the database. 
   * 
   * @returns {Promise<any>} 
   */
  async get(path){
    throw new Error('Not Implemented')
  }

  /**
   * Updates existing entry in the database.
   * If path not already defined then this 
   * method shall create it.
   * @param {*} path 
   */
  async update(path, data){
    throw new Error('Not Implemented')
  }
  /**
   * Delete item at location
   * @param {*} path 
   */
  async delete(path){
    throw new Error('Not Implemented')
  }

  /**
   * Convenience method to check for existence of data from database
   * Don't use this if you need the item later, simply use get and 
   * perform your own check. 
   * @param {*} path 
   */
  async exists(path){
    const item = await this.get(path)
    return typeof item !== 'undefined' && item !== null
  }
}