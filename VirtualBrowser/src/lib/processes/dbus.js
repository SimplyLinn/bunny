import ProcessSpawner from '../ProcessSpawner'

export const dbus = new ProcessSpawner({
  command : 'dbus-daemon',
  sudo : true,
  shell : true,
  args : [
    '--nofork',
    '--print-pid',
    '--config-file=/usr/share/dbus-1/system.conf'
  ],
  resolveOnChunk(chunk){
    this.log('Testing chunk')
    return /\d+/.test(chunk)
  },
  output : {
    data(proc, data){
      this.log(data.toString())
    }
  },
  opts : (env) => ({
    env,
  })
})