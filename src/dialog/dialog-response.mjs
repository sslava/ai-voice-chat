import DialogChunks from './dialog-chunks.mjs';
import Voice from '../voice.mjs';

export default class DialogResponse {
  interrupted = false;

  constructor(ai, history) {
    this.ai = ai;
    this.voice = new Voice(ai);
    this.history = history;
  }

  async process(audioStream) {
    const transcript = await this.ai.whisper(audioStream);
    if (!transcript || this.interrupted) {
      return;
    }
    console.log('user: ', transcript);
    this.history.push({ role: 'user', content: transcript });

    const chunks = new DialogChunks();
    let index = 0;

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
          this.voice.say(sentence, index++);
        }
      }
    }

    const sentence = chunks.popSentence();
    if (sentence) {
      this.voice.say(sentence, index++);
    }
    this.history.push({ role: 'assistant', content: chunks.text });
  }

  async interrupt() {
    this.interrupted = true;
    await this.voice.interrupt();
  }

  get state() {
    return this.voice.state;
  }
}
