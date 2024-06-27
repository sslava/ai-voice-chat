import fs from 'fs';
import DialogChunks from './dialog-chunks.mjs';
import Voice from '../voice.mjs';

export default class DialogResponse {
  interrupted = false;

  constructor(ai, history) {
    this.ai = ai;
    this.voice = new Voice(ai);
    this.history = history;
  }

  async process(file) {
    const transcript = await this.transcribe(file);
    if (!transcript || this.interrupted) {
      return;
    }
    console.log('user: ', transcript);
    this.history.push({ role: 'user', content: transcript });
    const response = await this.respond();
    if (response) {
      this.history.push({ role: 'assistant', content: response });
    }
  }

  async transcribe(file) {
    const audioStream = fs.createReadStream(file);
    const transcript = await this.ai.whisper(audioStream);
    audioStream.close();
    await fs.promises.rm(file);
    return transcript;
  }

  async respond() {
    const chunks = new DialogChunks();

    const completion = await this.ai.completion(this.history);
    for await (const chunk of completion) {
      if (this.interrupted) {
        return;
      }
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        chunks.push(delta);
        if (chunks.hasCompleteSentence()) {
          const sentence = chunks.popSentence();
          this.voice.say(sentence);
        }
      }
    }
    const sentence = chunks.popSentence();
    if (sentence) {
      this.voice.say(sentence);
    }
    return chunks.text;
  }

  async interrupt() {
    this.interrupted = true;
    await this.voice.interrupt();
  }

  get state() {
    return this.voice.state;
  }
}
