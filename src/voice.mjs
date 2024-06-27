import EventEmitter from 'node:events';
import fs from 'node:fs/promises';
import { nanoid } from 'nanoid';
import playSound from 'play-sound';

import { sleep } from './utils.mjs';

const player = playSound();

export default class Voice extends EventEmitter {
  interrupted = false;
  sessionId = nanoid();

  playIndex = 0;
  lastPlayed = -1;
  index = -1;

  audio = null;

  constructor(ai) {
    super();
    this.ai = ai;
    this.on('process', this.process);
  }

  say(text) {
    this.index++;
    console.log(`ai (${this.index}): `, text);
    this.emit('process', text, this.index);
  }

  async process(text, index) {
    const buffer = await this.ai.tts(text);
    if (this.interrupted) {
      return;
    }
    const filename = `./out/${this.sessionId}-${index}.mp3`;

    await fs.writeFile(filename, buffer);
    if (await this.waitForIndex(index)) {
      await this.playFile(filename);
      this.lastPlayed = index;
      if (!this.interrupted) {
        this.playIndex++;
      }
    }
    await fs.rm(filename);
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
      if (this.interrupted) {
        return false;
      }
      await sleep(20);
    }
    return true;
  }

  async interrupt() {
    this.interrupted = true;
    this.audio?.kill();
  }

  get state() {
    if (this.audio) {
      return 'speaking';
    }
    // all audio has been played
    if (
      this.lastPlayed !== -1 &&
      this.index !== -1 &&
      this.lastPlayed === this.index
    ) {
      return 'waiting';
    }
    return 'thinking';
  }
}
