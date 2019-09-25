const DockerDriverInterface = require('./DockerDriver')
const child_process = require('child_process')

/**
 * Starts a docker container locally. The default is set to
 */
module.exports = class LocalDockerDriver extends DockerDriverInterface {
  async init(options={}){
    const { 
      max = 1,
      dockerPath = 'docker' 
    } = options
    this.isDockerAvailable = true
    this.dockerPath = dockerPath
    this.containerLimit = max
    this.containers = new Map()
    // check if docker command exists
    try {
      console.log(`locating local docker installation: ${this.dockerPath}`)
      child_process.execSync(`${this.dockerPath} -v`)
      console.log(`local docker installation found`)
    }catch(e){
      console.warn(`Warning could not locate ${this.dockerPath}`)
      this.isDockerAvailable = false
    }
  }

  start(options = {}){
    const { 
      ...opts 
    } = options
    if(this.containers.size >= this.containerLimit){
      throw new Error('Maximum Container Limit Reached')
    }
    console.log(opts)
    console.log('Starting local docker instance')
  }

  stop(id){
    console.log('Stopping local docker instance')
  }
}