import child_process from 'child_process'
// Creates a function that returns the first argument
const idFn = (a) => () => a
const execOrEl = (el, args) => typeof el === 'function' ? el.apply(null, args) : el
/**
 * Timeout a promise within a certain amount of time
 * @param {*} promise 
 * @param {*} timeoutms 
 * @param {*} errors 
 */
const promiseWithTimeout = (promise, timeoutms, errorOnTimeout=true) => {
  const toP = new Promise((res, rej)=>{
    setTimeout(()=>{
      if(errorOnTimeout){
        return rej(new Error(`Promise did not resolve within ${timeoutms} ms`))
      }
      return res()
    }, timeoutms)
  })
  return Promise.race([toP, promise])
}
/**
 * Process Controller
 * args and opts can be an object or a function
 */
export default class ProcessSpawner {
  constructor(options={}){
    const { 
      command, 
      tag, 
      args,
      input, 
      output, 
      error, 
      opts,
      sudo = false,
      timeout = -1,
      ...flags
    } = options

    this.command = command
    this._tag = tag
    this.input = input
    this.output = output
    this.error = error
    this.sudo = sudo
    this.timeout = timeout
    this.args = args || []
    this.opts = opts || {}
    this.processes = {}
    this.flags = flags
  }

  get tag(){
    return `[${this._tag || this.command}]`
  }

  log(...args){
    console.log('\x1b[32m%s\x1b[0m', `${this.tag}`, ...args)
  }

  err(...args){
    console.log('\x1b[31m%s',`${this.tag}`, ...args, '\x1b[0m')
  }

  _getStdioOptions(env){
    return {
      shell : this.flags.shell || false,
      stdio : [
        (typeof this.input === 'string' && this.input) || this.input ? 'pipe' : 'ignore',
        (typeof this.output === 'string' && this.output) || this.output ? 'pipe':'ignore',
        (typeof this.error === 'string' && this.error) || this.error ? 'pipe' : 'ignore',
      ],
      ...execOrEl(this.opts, [env])
    }
  }
  /**
   * 
   * @param {child_process.ChildProcessWithoutNullStreams} process 
   */
  _attachListeners(process){
    [ [process.stdout, this.output],
      [process.stdin,  this.input ],
      [process.stderr, this.error ] ]
    .forEach(([stream, listeners])=>{
      if(!stream || typeof listeners === 'string') return
      for(let eventName in listeners){
        const [, event='on', type] = eventName.match(/^(on(?:ce)?)?(.*)$/)
        if(!type) continue // TODO: throw a warning
        let listenerFnOrArray = listeners[eventName]
        if(typeof listenerFnOrArray === 'function'){
          listenerFnOrArray = [listenerFnOrArray]
        }
        listenerFnOrArray.forEach(fn => stream[event](type.toLowerCase(), fn.bind(this, process)))
      }
    })
    return process
  }
  /**
   * TODO: add a path variable 
   * @param {*} env 
   * @param {*} args 
   * @param {*} opts
   * @returns {Promise<child_process.ChildProcessWithoutNullStreams>}
   */
  spawn(id, env, args=[], opts={}){
    const spawnPromise = new Promise((res, rej) => {
      // todo: handle sudo
      args = execOrEl(this.args, [env, args])
      opts = this._getStdioOptions(env)
      
      let cmd = this.sudo ? 'sudo' : this.command
      args = this.sudo ? [this.command, ...args] : args
      // this.log(cmd, args)
      this.log(cmd, args.join(" "))
      const process = this._attachListeners(child_process.spawn(cmd, args, opts))
      this.processes[id] = process
      process.resolve = res 
      process.reject = rej
      this.log(`pid: ${process.pid}`)

      process.once('exit', (code, signal)=>{
        if(code !== 0){
          rej(new Error(`Process exited with code ${code}${signal?` (${signal})`:''}`))
        }
        const logMethod = code === 0 ? this.log : this.err
        logMethod.call(this, `Process exited with code ${code}${signal?` (${signal})`:''}`)
      })
      // if no output at all, resolve immediately
      if(!process.stdout && !process.stderr){
        return res(process)
      }
      // boolean
      if(this.flags.resolveOnFirstChunk){
        process.stdout.once('data', () => {
          res(process)
        })
      }
      // fn
      if(typeof this.flags.resolveOnChunk === 'function'){
        process.stdout.on('data', (chunk)=>{
          if(this.flags.resolveOnChunk.call(this, chunk.toString())){
            res(process)
          }
        })
      }
      if(this.flags.rejectOnFirstError){
        process.stderr.once('data', (chunk) => {
          rej(new Error(chunk.toString()))
        })
      }
      if(typeof this.flags.rejectOnError === 'function'){
        process.stderr.on('data', (chunk)=>{
          if(this.flags.rejectOnError.call(this, chunk.toString())){
            rej(new Error(chunk.toString()))
          }
          // todo: remove listener
        })
      }
    })
    if(this.timeout > -1){
      return promiseWithTimeout(spawnPromise, this.timeout, this.flags.errorOnTimeout)
    }
    return spawnPromise
  }

  write(id, data){

  }

  pipe(id, stream){

  }
}