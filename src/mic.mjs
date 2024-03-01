import fs from 'node:fs';
import mic  from 'mic';

export default class MicManager {
  constructor() {
    this.started = false;
  }

  isStarted() {
    return this.started;
  }

  start() {
    if (this.started) {
      return;
    }
    this.started = true;
    this.micInstance = mic({ rate: '16000', channels: '1', fileType: 'wav' });

    const micInputStream = this.micInstance.getAudioStream();
    const stream = fs.createWriteStream('output.wav');
    micInputStream.pipe(stream);
    this.micInstance.start();
  }

  stop() {
    if (!this.started) {
      return;
    }
    this.micInstance.stop();
    this.started = false;

    return fs.createReadStream('output.wav');
  }
};
