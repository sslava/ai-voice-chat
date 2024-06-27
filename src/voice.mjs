import EventEmitter from 'node:events';
import fs from 'node:fs/promises';
import { nanoid } from 'nanoid';
import playSound from 'play-sound';

import { sleep } from './utils.mjs';

const player = playSound();

export default class Voice extends EventEmitter {
  interrupted = false;
  sessionId = nanoid();

  constructor(ai) {
    super();
    this.ai = ai;
    this.playIndex = 0;

    this.lastIndex = -1;
    this.lastPlayed = -1;

    this.audio = null;

    this.on('process', this.process);
  }

  say(text, index) {
    if (this.interrupted) {
      return;
    }
    if (index >= this.lastIndex) {
      this.lastIndex = index;
    }
    console.log(`ai (${index}): `, text);
    this.emit('process', text, index);
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
    if (this.audio) {
      this.audio.kill();
    }
  }

  get state() {
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
}
