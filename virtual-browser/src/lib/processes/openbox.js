import ProcessSpawner from '../ProcessSpawner'

export const openbox = new ProcessSpawner({
  command : 'openbox',
  shell : true,
  timeout : 500,
  errorOnTimeout : false,
  opts : (env)=>({
    env : {
      DISPLAY : `:${env.DISPLAY}`
    }
  }),
  output : {
    data(proc, data){
      // TODO: Check if error and reject
      this.log(data.toString())
    }
  },
  error : {
    data(proc, data){
      this.err(data.toString())
    }
  }
})