import fs from 'fs';
import SentenceBuffer from './sentence-buffer.mjs';
import Voice from '../voice.mjs';

export default class DialogResponse {
  interrupted = false;

  constructor(ai) {
    this.ai = ai;
    this.voice = new Voice(ai);
  }

  async process(audio, history) {
    const transcript = await this.transcribe(audio);
    if (!transcript || this.interrupted) {
      return;
    }
    console.log('user:', transcript);
    history.push({ role: 'user', content: transcript });
    const response = await this.generateResponse(history);
    if (response) {
      history.push({ role: 'assistant', content: response });
    }
  }

  async transcribe(file) {
    const audioStream = fs.createReadStream(file);
    const transcript = await this.ai.transcribe(audioStream);
    audioStream.close();
    await fs.promises.rm(file);
    return transcript;
  }

  async generateResponse(history) {
    const completion = await this.ai.completion(history);

    const llmResponse = new SentenceBuffer();
    for await (const chunk of completion) {
      if (this.interrupted) {
        return;
      }
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        llmResponse.push(delta);
        if (llmResponse.hasCompleteSentence()) {
          const sentence = llmResponse.popSentence();
          this.voice.ttsAndPlay(sentence);
        }
      }
    }
    const sentence = llmResponse.popSentence();
    if (sentence) {
      this.voice.ttsAndPlay(sentence);
    }
    return llmResponse.text;
  }

  async interrupt() {
    this.interrupted = true;
    await this.voice.interrupt();
  }

  get state() {
    return this.voice.state;
  }
}
