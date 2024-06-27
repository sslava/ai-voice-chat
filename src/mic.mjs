import fs from 'node:fs';
import mic from 'mic';
import { nanoid } from 'nanoid';

export default class MicManager {
  currentFile_ = null;

  get isListening() {
    return !!this.currentFile_;
  }

  start() {
    if (this.isListening) {
      return;
    }
    this.currentFile_ = `mic-${nanoid()}.wav`;
    this.mic = mic({ rate: '16000', channels: '1', fileType: 'wav' });

    const micInputStream = this.mic.getAudioStream();
    const stream = fs.createWriteStream(this.currentFile_);
    micInputStream.pipe(stream);
    this.mic.start();
  }

  stop() {
    if (!this.isListening) {
      return null;
    }
    const fileName = this.currentFile_;
    this.currentFile_ = null;
    this.mic.stop();
    return fileName;
  }
}
