import ProcessSpawner from '../ProcessSpawner'

export const xdotool = new ProcessSpawner({
  command : 'xdotool',
  shell : true,
  timeout : 500,
  errorOnTimeout : false,
  opts : (env) => ({
    env : {
      DISPLAY : `:${env.DISPLAY}`
    }
  }),
  input : 'pipe',
  output : {
    data(proc, data){
      this.log(data.toString())
    }
  },
  error : {
    data(proc, data){
      this.err(data.toString())
    }
  },
  args : ['-']
})