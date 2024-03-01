import EventEmitter  from 'node:events';
import fs from  'node:fs';
import { v4 as uuid } from 'uuid';
import playSound from 'play-sound';

const player = playSound();

export default class ConversationVoice extends EventEmitter {
  /**
   * @param {AIWrapper} ai - The AI wrapper object.
   */
  constructor(ai) {
    super();
    this.ai = ai;
    this.aborted = false;
    this.playIndex = 0;

    this.sessionId = uuid();

    this.on('say', this.startSaying);

    this.lastIndex = -1;
    this.lastPlayed = -1;

    this.audio = null;
  }

  say(text, index) {
    if (this.isAborted()) {
      return;
    }
    if (index >= this.lastIndex) {
      this.lastIndex = index;
    }
    this.emit('say', text, index);
  }

  async startSaying(text, index) {
    console.log(`god (${index}): `, text);
    if (this.isAborted()) {
      return;
    }
    const buffer = await this.ai.tts(text);
    if (this.isAborted()) {
      return;
    }
    const filename = `./out/${this.sessionId}-${index}.mp3`;

    await fs.promises.writeFile(filename, buffer);

    if (await this.waitForIndex(index)) {
      await this.playFile(filename);
      this.lastPlayed = index;
      if (!this.isAborted()) {
        this.playIndex++;
      }
    }
    await fs.promises.rm(filename);
  }

  async playFile(filename) {
    this.audio = player.play(filename, (err) => {
      if (err) {
        console.error('speech: error playing', err);
      }
    });
    await new Promise((resolve) => {
      this.audio.on('close', resolve);
      this.audio.on('exit', resolve);
    });

    this.audio = null;
  }

  async waitForIndex(index) {
    while (index !== this.playIndex) {
      if (this.isAborted()) {
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    return true;
  }

  isAborted() {
    return this.aborted;
  }

  async abort() {
    console.log('speech: aborting...');
    this.aborted = true;
    if (this.audio) {
      this.audio.kill();
    }
  }

  getState() {
    if (this.audio) {
      return 'speaking';
    }
    // all audio has been played
    if (
      this.lastPlayed !== -1 &&
      this.lastIndex !== -1 &&
      this.lastPlayed === this.lastIndex
    ) {
      return 'waiting';
    }

    return 'thinking';
  }
};
