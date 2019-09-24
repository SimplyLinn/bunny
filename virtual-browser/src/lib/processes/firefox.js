import ProcessSpawner from '../ProcessSpawner'

export const firefox = new ProcessSpawner({
  command : 'firefox-esr',
  shell : true,
  timeout : 500,
  errorOnTimeout : false,
  args : (env, [width, height]) => [
    `--display=:${env.DISPLAY}`, 
    '--setDefaultBrowser',
    '-width', width,
    '-height', height,
    'https://www.youtube.com/'
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