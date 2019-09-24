import ProcessSpawner from '../ProcessSpawner'

export const xvfbFirefox = new ProcessSpawner({
  command : 'xvfb-run',
  tag : 'xvfb-firefox',
  shell : true,
  sudo : true,
  timeout : 500, // Wait half a second (todo)
  errorOnTimeout : false,
  args : (env, [width, height, bitDepth]) => [
    // '--auto-servernum',
    '--server-num', env.DISPLAY,
    '--server-args', `"-screen 0 ${width}x${height}x${bitDepth}"`,
    'firefox-esr',
    '--setDefaultBrowser',
    '-width', width,
    '-height', height,
    'https://www.youtube.com/'
  ],
  input : 'ignore',
  output : {
    data(proc, chunk){
      this.log('xvfb-firefox', chunk.toString())
    }
  },
  error : {
    data(proc, chunk){
      this.err('xvfb-firefox', chunk.toString())
    }
  },
})