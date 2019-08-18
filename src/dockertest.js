const {Docker} = require('node-docker-api');
const fs = require('fs');
const docker = new Docker({host: 'http://localhost', port: 2375});

const containers = new Set;

const net = require('net');

async function gracefulShutdown() {
  console.log("Caught interrupt signal, gracefully stopping containers");
  for(container of containers) {
    try {
      await container.stop();
    } catch (err) {
      console.error('error when stopping container', err);
    }
  }
  process.exit();
}

process.on('SIGINT', gracefulShutdown);

function getBrowserStream(width=1920, height=1080, cd=24) {
  const server = net.createServer(c=>{
    server.close();
    c.pipe(fs.createWriteStream('./testvid', {encoding:'binary'}));
  });
  server.listen(4545,()=>{
    console.log('Getting stream');
    let _container;
    const streams = {};
    return docker.container.create({
      Image: 'chrome-viewer',
      Cmd: [`${width}x${height}x${cd}`]
    }).then(container => {
        containers.add(container);
        _container = container;
        return container.start();
      })
      .then(() => {
        const Cmd = [
          'ffmpeg',
          '-loglevel', 'quiet',
          '-f', 'x11grab',
          '-i', ':100',
          '-s', `${width}x${height}`,
          '-t', '10',
          '-f', 'rawvideo',
          '-r', '1',
          '-vf', 'format=yuv420p',
          'tcp://192.168.10.166:4545'
        ];
        console.log(Cmd.join(' '));
        return _container.exec.create({
          Cmd
        })
      }).then(exec => {
        return exec.start({ Detach: false })
      })
      .then(stream => {
        stream.pipe(fs.createWriteStream('./testvid', {encoding:'binary'}));
        streams.video=stream;

        return streams;
      })
      /*.then(() => {
        return _container.exec.create({
          AttachStdout: true,
          AttachStderr: false,
          Cmd: [
            'ffmpeg',
            '-f', 'x11grab',
            '-i', ':100',
            '-s', '1920x1080',
            '-an',
            '-f', 'rawvideo',
            '-r', '30',
            '-vf', 'format=yuv420p',
            'pipe:1'
          ]
        })
      })*/
  });
}
getBrowserStream();
module.exports=getBrowserStream;
