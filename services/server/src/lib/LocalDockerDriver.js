const Docker = require('dockerode')
const Stream = require('stream')
const uuid = require('uuid')
const DockerDriverInterface = require('./DockerDriver')
const child_process = require('child_process')

/**
 * Starts a docker container locally. The default is set to
 */
module.exports = class LocalDockerDriver extends DockerDriverInterface {
  async init(options={}){
    const { 
      max = 1,
      signalServer = 'wss://192.168.0.12',
      imageName = 'virtual-browser',
      dockerPath = 'docker' 
    } = options
    this.docker = new Docker()
    this.imageName = imageName
    this.signalServer = signalServer
    this.isDockerAvailable = true
    this.dockerPath = dockerPath
    this.containerLimit = max
    this.containers = new Set()
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
    return new Promise(async (res, rej) => {
      console.log('Starting local docker instance')
      let container
      // stdout and stderr streams used to dermine when the container 
      // is ready or if the container errored
      const streams = new Array(
        new Stream.Writable({
          write : (chunk, encoding, next)=>{
            const str = chunk.toString()
            // I bet this will eventually break something somewhere :)
            if(!/^[🤔😊]/i.test(str)){
              return next()
            }
            console.log(str)
            if(/^😊/.test(str)){
              console.log('Container Initialization Complete')
              res(container.id)
            }
            next()
          },
        }),
        new Stream.Writable({
          write : (chunk, encoding, next) => {
            const data = chunk.toString()
            console.log(data)
            if(/^😞/.test(data)){
              rej(data)
              return next()
            }
            next()
          }
        })
      ).map(stream => {
        return stream.once('close',()=>{
          rej('an output stream closed unexpectedly')
        })
        .once('error', (err) => {
          rej(err)
        })
      })
      const args = [
        "-s",  this.signalServer
      ]
      /**
       * @type {Object<Docker.ContainerCreateOptions>}
       */
      const opts = {
        Image : this.imageName,
        Tty : false,
        Cmd : args,
        HostConfig : {
          NetworkMode : 'host',
          ShmSize : 1024 * 1024 * 1024 // 1gb = 1024 bytes * 1024 kb * 1024 mb
        }
      }
      try {
        // await this.docker.run(this.imageName, args, streams, opts)
        container = await this.docker.createContainer(opts)
        const stream = await container.attach({ stream : true, stdout : true, stderr: true })
        container.modem.demuxStream(stream, ...streams)
        this.containers.add(container.id)
        await container.start()
      }catch(e){
        rej(e)
      }
    })
  }

  async stop(id){
    const container = await this.docker.getContainer(id)
    container.stop()
    this.containers.delete(id)
  }

  async destroy(){
    return Promise.all(Array.from(this.containers).map((id) => {
      return this.stop(id)
    }))
  }
}