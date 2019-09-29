import ProcessSpawner from '../ProcessSpawner'

export const firefox = new ProcessSpawner({
  command : 'firefox-esr',
  shell : true,
  timeout : 500,
  errorOnTimeout : false,
  args : (env, [width, height, url='']) => [
    `--display=:${env.DISPLAY}`, 
    '--setDefaultBrowser',
    '-width', width,
    '-height', height,
    url
  ],

  output : {
    data(proc, data){
      this.log(data.toString())
    }
  },
  error : {
    data(proc, data){
      this.err(data.toString())
    }
  }
})