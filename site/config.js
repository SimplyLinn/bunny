module.exports = {
  host: '10.0.75.1' || 'docker.for.mac.localhost',
  dockerConf: {
    socketPath: '//./pipe/docker_engine' || '/var/run/docker.sock'
  }
};