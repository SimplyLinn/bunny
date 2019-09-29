import * as wrtc from 'wrtc'

import Yuv420pParser from './yuv420pParser'
import AudioParser from './audioParser'
import ProcessBus from './ProcessBus'
import { dbus, xvfb, firefox, pulseAudio, openbox, ffmpeg, xdotool } from './processes'
import InstructionReader from './instructionReader'


function keyRemapper(key) {
  return {
    ' ':'space',
    '`':'0xff80'
  }[key] || key
  switch(key) {
    case '':
      break 
    case ' ':
      key = '0xff80'
      break
    case 'Backspace':
      key = '0xff08'
      break
    case 'Enter':
      key = '0xff8d'
      break
    case '.':
      key = '0x002e'
      break
    case '!':
      key = '0x0021'
      break
    case ',':
      key = '0x002c'
      break
    default:
      key = key
      break
  }
  return key.replace(/'/, `\'`) // maybe double backslash
}

// function ffmpeg_old(env, width, height) {
//   const vidPipe = spawn('ffmpeg', vidArgs, vidOpts).stdout;
//   const audPipe = spawn('ffmpeg', audArgs, audOpts).stdout;
//   return [vidPipe, audPipe];
// }

/**
 * Controls all of the necessary elements in order to display and 
 * interact with the virtual browser on the system.
 */
export default class VirtualBrowser extends ProcessBus {
  constructor(options = {}) {
    super(options)
    const { 
      ignoreInput = false,
      width    = 1080, 
      height   = 720, 
      bitDepth = 24, 
      display  = 20,
      defaultUrl = "https://www.google.com",
    } = options

    this.width = width
    this.height = height
    this.bitDepth = bitDepth
    this.display = display
    this.ignoreInput = ignoreInput
    this.inputStream = null
    this.defaultUrl = defaultUrl
    this.env = { DISPLAY : display }
    this.instructionReader = new InstructionReader()
    this._createSources()
  }

  _createSources(){
    const audioData = { 
      sampleRate    : 44100, 
      channelCount  : 2, 
      samples       : null 
    }
    
    // This next line closes the program without throwing an error on alpine
    this.vidSource = new wrtc.nonstandard.RTCVideoSource()
    this.vidTrack = this.vidSource.createTrack()
    
    this.audSources = new Set()

    this.yuv420p = new Yuv420pParser(this.width * this.height * 1.5, 4)

    this.yuv420p.onFrame = (data) => {
      this.vidSource.onFrame({
        width: this.width, 
        height: this.height, 
        data 
      });
    }

    this.yuv420p.onClose = () => {
      this.vidTrack.stop();
    }

    // this.audioParser = new AudioParser(16, audioData.sampleRate, audioData.channelCount, 4*3)

    // this.audioParser.onFrame =(samples) => {
    //   audioData.samples = samples
    //   this.audSources.forEach(audSource => audSource.onData({...audioData}))
    // }
  }

  async init() {
    // Be careful about race conditions here
    await this.spawnProcess('dbus', dbus)
    await this.spawnProcess('xvfb', xvfb, [
      this.width, 
      this.height,
      this.bitDepth
    ])
    // Should be possible to launch the following in parallel 
    await this.spawnProcess('openbox', openbox)
    // await this.spawnProcess('pulse-audio', pulseAudio, [this.env.DISPLAY])
    await this.spawnProcess('firefox', firefox, [
      this.width, this.height,
      this.defaultUrl
    ])
    // firefox(this.env, this.width, this.height);
    // this.xdoin = xdotool(this.env).stdin;
    await this.spawnProcess('xdo', xdotool)
    this.inputStream = xdotool.processes['xdo'].stdin

    await this.spawnProcess('vstream', ffmpeg.video, [this.width, this.height])
    // await this.spawnProcess('ffmpeg-audio', ffmpeg.audio)
    const vidPipe = ffmpeg.video.processes['vstream'].stdout
    // const [vidPipe, audPipe] = ffmpeg(this.env, this.width, this.height);
    vidPipe.pipe(this.yuv420p);
    // audPipe.pipe(this.audioParser);
  }

  mouseMove(x, y){
    return this.writeCommand(`mousemove ${x} ${y}`)
  }

  mouseDown(x, y, btn){
    this.mouseMove(x, y)
    if(btn < 4 || btn > 7)
      return this.writeCommand(`mousedown ${btn}`)
    return this.writeCommand(`click ${btn}`)
  }

  mouseUp(x, y, btn){
    this.mouseMove(x, y)
    return this.writeCommand(`mouseup ${btn}`)
  }

  keyDown(key){
    const mappedKey = keyRemapper(key)
    return this.writeCommand(`keydown ${mappedKey}`)
  }

  keyUp(key){
    const mappedKey = keyRemapper(key)
    return this.writeCommand(`keyup ${mappedKey}`)
  }

  toggleInput(bool){
    this.ignoreInput = typeof bool === 'boolean' ? !bool : !this.ignoreInput
  }

  writeCommand(command){
    if(this.ignoreInput || !this.inputStream) return false
    // console.log(`writing command: ${command}`)
    this.inputStream.write(`${command}\n`)
  }

  readInstructions(){
    
  }

  /**
   * Get a stream for a peer(?)
   * @param {*} peer 
   */
  getStream() {
    // const audSource = new wrtc.nonstandard.RTCAudioSource()
    // this.audSources.add(audSource);
    // const audTrack = audSource.createTrack()
    const stream = new wrtc.MediaStream([this.vidTrack /*, audTrack */])
    // peer.on('close', () => {
      // this.audSources.delete(audSource);
      // audTrack.stop();
    // });
    return stream;
  }

  close(){
    // Cleanup and shut down
  }
}