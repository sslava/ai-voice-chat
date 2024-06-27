import fs from 'node:fs';
import mic from 'mic';

export default class MicManager {
  listening_ = false;

  get isListening() {
    return this.listening_;
  }

  start() {
    if (this.listening_) {
      return;
    }
    this.listening_ = true;
    this.mic = mic({ rate: '16000', channels: '1', fileType: 'wav' });

    const micInputStream = this.mic.getAudioStream();
    const stream = fs.createWriteStream('output.wav');
    micInputStream.pipe(stream);
    this.mic.start();
  }

  stop() {
    if (!this.listening_) {
      return null;
    }
    this.listening_ = false;
    this.mic.stop();
    return fs.createReadStream('output.wav');
  }
}
