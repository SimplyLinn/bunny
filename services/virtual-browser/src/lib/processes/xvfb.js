import ProcessSpawner from '../ProcessSpawner'

export const xvfb = new ProcessSpawner({
  command : 'Xvfb',
  shell : true,
  timeout : 500,
  errorOnTimeout : false,
  args : (env, [width, height, bitDepth]) => ([
    `:${env.DISPLAY}`,
    '-ac',
    '-audit', '2',
    `-screen`, `0 ${width}x${height}x${bitDepth}`
  ]),
  output : {
    data(proc, data){
      this.log(data.toString())
    }
  },
  error : {
    // Xvfb outputs successful connections to stderr for some reason
    data(proc, data){
      const str = data.toString()
      if(/client \d+ connected/.test(str)){
        return this.log(str)
      }
      return this.err(str)
    }
  }
})