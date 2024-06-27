import OpenAIAPI from '../aiwrapper.mjs';
import MicManager from '../mic.mjs';
import DialogResponse from './dialog-response.mjs';

export class Dialog {
  mic = new MicManager();
  ai = new OpenAIAPI();

  state_ = 'idle';
  response = null;

  constructor(prompt) {
    this.prompt = prompt;
    this.history = this.emptyHistory();
  }

  greetings() {
    this.state_ = 'waiting';
  }

  async listen() {
    if (this.mic.isListening) {
      return;
    }
    await this.interrupt();
    this.mic.start();
  }

  async respond() {
    if (this.mic.isListening) {
      const wavFile = this.mic.stop();
      this.response = new DialogResponse(this.ai, this.history);
      await this.response.process(wavFile);
    }
  }

  async bye() {
    await this.interrupt();
    this.history = this.emptyHistory();
    this.state_ = 'idle';
  }

  async interrupt() {
    if (this.response) {
      await this.response.interrupt();
      this.response = null;
    }
  }

  get state() {
    if (this.mic.isListening) {
      return 'listening';
    }
    return this.response?.state ?? this.state_;
  }

  emptyHistory() {
    return [{ role: 'system', content: this.prompt }];
  }
}
