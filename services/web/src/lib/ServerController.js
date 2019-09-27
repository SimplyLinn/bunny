const ServerController = class {
  baseUrl = 'https://localhost'

  async fetch(endpoint){
    const initOpts = {
      credentials : 'include',
      headers : {
        'Content-Type': 'application/json',
      }
    }
    const result = await fetch(this.baseUrl + endpoint, initOpts)
    const data = result.json()
    if(!result.ok){
      throw new Error(data)
    }
    return data
  }

  ping(){
    return this.fetch('/')
  }
}

export default new ServerController()