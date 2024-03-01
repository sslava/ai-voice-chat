import { OpenAI } from 'openai';

export default class AIWrapper {
  constructor() {
    this.openai = new OpenAI();
  }

  async whisper(stream) {
    const result = await this.openai.audio.transcriptions.create({
      file: stream,
      model: 'whisper-1',
      temperature: 0.5,
      response_format: 'json',
    });
    return result.text;
  }

  async completion(messages) {
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.5,
      messages: messages,
      stream: true,
    });
    return stream;
  }

  async tts(text) {
    const result = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      response_format: 'mp3',
      input: text,
    });
    const arrayBuffer = await result.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
};
