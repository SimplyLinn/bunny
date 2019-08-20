const {Docker} = require('node-docker-api');
const net = require('net');
const { host } = require('../config');
 
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

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
        Image: 'browser-viewer',
        Cmd: [`${width}x${height}x${cd}`]
      }).then(container => {
        containers.add(container);
        return container.start();
      });

      const dbusCmd = [
        'sudo',
        'dbus-daemon',
        '--config-file=/usr/share/dbus-1/system.conf'
      ];
      console.log(dbusCmd.join(' '));
      container.exec.create({
        Cmd: dbusCmd
      }).then(exec => {
        return exec.start({ Detach: false })
      }).then(stream => stream.pipe(process.stdout));

      const xsmCmd = [
        'sudo',
        'xsm',
        '-display', ':100'
      ];
      console.log(xsmCmd.join(' '));
      container.exec.create({
        Cmd: xsmCmd
      }).then(exec => {
        return exec.start({ Detach: false })
      }).then(stream => stream.pipe(process.stdout));

      const obCmd = [
        'sh', '-c',
        'DISPLAY=:100 openbox --replace'
      ];
      console.log(obCmd.join(' '));
      container.exec.create({
        Cmd: obCmd
      }).then(exec => {
        return exec.start({ Detach: false })
      }).then(stream => stream.pipe(process.stdout));

      const ffmpegCmd = [
        'ffmpeg',
        '-y',
        '-r', '30',
        '-f', 'x11grab',
        '-s', `${width}x${height}`,
        '-draw_mouse', '1',
        '-i', ':100',
        '-f', 'rawvideo',
        '-vf', 'format=yuv420p',
        `tcp://${host}:${vidServer.address().port}`
      ];
      console.log(ffmpegCmd.join(' '));
      container.exec.create({
        Cmd: ffmpegCmd
      }).then(exec => {
        return exec.start()
      });

      const chromeCmd = [
        'sh', '-c',
        `DISPLAY=:100 google-chrome --no-sandbox --disable-features=VizDisplayCompositor https://www.youtube.com/watch?v=dQw4w9WgXcQ`
        //`DISPLAY=:100 firefox https://www.youtube.com/`
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
        `DISPLAY=:100 nc ${host} ${cmdServer.address().port} | xdotool -`
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
