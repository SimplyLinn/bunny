const {Docker} = require('node-docker-api');
const net = require('net');
 
const docker = new Docker({host: 'http://localhost', port: 2375});

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
  return new Promise((resolve, reject) => {
    retObj = {video: null, audio: null, xdotool: null};
    const vidServer = net.createServer(c=>{
      retObj.video = c;
      if(retObj.xdotool) resolve(retObj);
    });
    const cmdServer = net.createServer(c=>{
      retObj.xdotool = c;
      if(retObj.video) resolve(retObj);
    });
    cmdServer.listen(4546,async ()=>{
      console.log('Getting xdotool stdin');
    });
    vidServer.listen(4545,async ()=>{
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
        'tcp://192.168.10.166:4545'
      ];
      console.log(ffmpegCmd.join(' '));
      container.exec.create({
        Cmd: ffmpegCmd
      }).then(exec => {
        return exec.start()
      });

      const chromeCmd = [
        'sh', '-c',
        `DISPLAY=:100 google-chrome --window-position=0,0 --window-size=${width},${height} --no-sandbox https://www.youtube.com/watch?v=dQw4w9WgXcQ`
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
        'DISPLAY=:100 nc 192.168.10.166 4546 | xdotool -'
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
