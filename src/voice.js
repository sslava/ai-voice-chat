const EventEmitter = require('events');
const uuid = require('uuid').v4;
const fs = require('fs');
const player = require('play-sound')();

module.exports = class ConversationVoice extends EventEmitter {
  /**
   * @param {AIWrapper} ai - The AI wrapper object.
   */
  constructor(ai) {
    super();
    this.ai = ai;
    this.aborted = false;
    this.play_index = 0;

    this.session_id = uuid();

    this.on('say', this.start_saying);

    this.audio = null;
  }

  say(text, index) {
    if (this.isAborted()) {
      return;
    }
    this.emit('say', text, index);
  }

  async start_saying(text, index) {
    console.log(`god (${index}): `, text);
    if (this.isAborted()) {
      return;
    }
    const buffer = await this.ai.tts(text);
    if (this.isAborted()) {
      return;
    }
    const filename = `./out/${this.session_id}-${index}.mp3`;

    await fs.promises.writeFile(filename, buffer);

    if (await this.wait_for_index(index)) {
      await this.play_file(filename);
      if (!this.isAborted()) {
        this.play_index++;
      }
    }
    await fs.promises.rm(filename);
  }

  async play_file(filename) {
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

  async wait_for_index(index) {
    while (index !== this.play_index) {
      if (this.isAborted()) {
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return true;
  }

  isAborted() {
    if (this.aborted) {
      console.log('speech: aborted');
    }
    return this.aborted;
  }

  async abort() {
    console.log('speech: aborting...');
    this.aborted = true;
    if (this.audio) {
      this.audio.kill();
    }
  }
}
