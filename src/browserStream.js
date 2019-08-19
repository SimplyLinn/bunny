const {Docker} = require('node-docker-api');
const net = require('net');
 
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
function getLocalIp() {
  return docker.network.get('bridge').status().then(n=>n.data.IPAM.Config[0].Gateway);
}

const containers = new Set;

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
  return new Promise(async (resolve, reject) => {
    retObj = {video: null, audio: null, xdotool: null};
    const ip = await getLocalIp();
    const vidServer = net.createServer(c=>{
      retObj.video = c;
      if(retObj.xdotool) resolve(retObj);
    });
    const cmdServer = net.createServer(c=>{
      retObj.xdotool = c;
      if(retObj.video) resolve(retObj);
    });
    cmdServer.listen(0, async ()=>{
      console.log('Getting xdotool stdin');
    });
    vidServer.listen(0, async ()=>{
      console.log('Getting stream');
      const container = await docker.container.create({
        Image: 'chrome-viewer',
        Cmd: [`${width}x${height}x${cd}`]
      }).then(container => {
        containers.add(container);
        return container.start();
      });

      const ffmpegCmd = [
        'ffmpeg',
        '-y',
        '-r', '30',
        '-f', 'x11grab',
        '-s', `${width}x${height}`,
        '-i', ':100',
        '-f', 'rawvideo',
        '-vf', 'format=yuv420p',
        `tcp://docker.for.mac.localhost:${vidServer.address().port}`
      ];
      console.log(ffmpegCmd.join(' '));
      container.exec.create({
        Cmd: ffmpegCmd
      }).then(exec => {
        return exec.start()
      });

      const chromeCmd = [
        'sh', '-c',
        `DISPLAY=:100 firefox https://www.youtube.com/watch?v=dQw4w9WgXcQ`
        //`DISPLAY=:100 google-chrome --window-position=0,0 --window-size=${width},${height} --no-sandbox https://www.youtube.com/watch?v=dQw4w9WgXcQ`
      ];
      console.log(chromeCmd.join(' '));
      container.exec.create({
        AttachStdout: true,
        AttachStderr: true,
        Cmd: chromeCmd,
        Env: [
          'DISPLAY=:100'
        ]
      }).then(exec => {
        return exec.start({ Detach: false })
      }).then(stream => stream.pipe(process.stdout));

      const xdotoolCmd = [
        'sh', '-c',
        `DISPLAY=:100 nc docker.for.mac.localhost ${cmdServer.address().port} | xdotool -`
      ];
      console.log(xdotoolCmd.join(' '));
      container.exec.create({
        AttachStdout: true,
        AttachStderr: true,
        Cmd: xdotoolCmd,
        Env: [
          'DISPLAY=:100'
        ]
      }).then(exec => {
        return exec.start({ Detach: false })
      }).then(stream => stream.pipe(process.stdout));

    });
  });
}

module.exports=getBrowserStream;
