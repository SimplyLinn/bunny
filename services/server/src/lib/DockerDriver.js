/**
 * Decoupled driver that launches and stops 
 * a docker instance
 */
module.exports = class DockerDriver {
  async init(){}
  /**
   * Starts the docker container.
   * 
   * Returns some kind of identifying object
   * that can be used to stop the container
   * later on. Must be serializable.
   * @returns {Promise<any>}
   */
  async start(options={}){
    throw new Error('Not Implemented')
  }

  async stop(id){
    throw new Error('Not Implemented')
  }
}