import ProcessSpawner from '../ProcessSpawner'
// pulseaudio --system --daemonize --disallow-exit --exit-idle-time=-1 -vvvv --file "./pulse-config.pa"
export const pulseAudio = new ProcessSpawner({
  command : 'pulseaudio',
  shell : true,
  timeout : 500,
  errorOnTimeout : false,
  args : [
    '--system',
    // '--daemonize',
    '--disallow-exit',
    '--exit-idle-time=1',
    '--file=/bin/pulse-config.pa',
    '-vv'
  ],
  output : {
    data(proc, data){
      this.log(data.toString())
    }
  },
  error : {
    data(proc, data){
      const str = data.toString().split(/\n/).forEach(line=>{
        // filter out warnings and info
        if(/^E:/.test(line)){
          return this.err(line)
        }
        this.log(line)
      })
    }
  }
})