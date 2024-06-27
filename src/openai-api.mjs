import { OpenAI } from 'openai';

export default class OpenAIAPI {
  constructor() {
    this.openai = new OpenAI();
  }

  async transcribe(stream) {
    const result = await this.openai.audio.transcriptions.create({
      file: stream,
      model: 'whisper-1',
      temperature: 0.5,
      response_format: 'json',
    });
    return result.text;
  }

  async completion(messages) {
    return await this.openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.5,
      messages: messages,
      stream: true,
    });
  }

  async tts(text, voice = 'nova') {
    const result = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice,
      response_format: 'mp3',
      input: text,
    });
    const arrayBuffer = await result.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}