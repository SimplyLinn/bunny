module.exports = {
  host: 'docker.for.mac.localhost' || '10.0.75.1',
  dockerConf: {
    socketPath: '/var/run/docker.sock' || '//./pipe/docker_engine'
  }
};