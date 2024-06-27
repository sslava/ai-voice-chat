import OpenAIAPI from '../aiwrapper.mjs';
import MicManager from '../mic.mjs';
import ConversationResponse from '../conversation-response.mjs';

export class Dialog {
  mic = new MicManager();
  ai = new OpenAIAPI();

  state = 'idle';
  response = null;

  constructor(prompt) {
    this.prompt = prompt;
    this.history = this.emptyHistory();
  }

  greetings() {
    this.state = 'waiting';
  }

  async listen() {
    if (!this.mic.isListening) {
      await this.interrupt();
      this.mic.start();
      this.state = 'listening';
    }
  }

  async respond() {
    if (!this.mic.isListening) {
      return;
    }
    const stream = this.mic.stop();
    this.response = new ConversationResponse(this.ai, this.history);
    await this.response.start(stream);
  }

  async bye() {
    await this.interrupt();
    this.history = this.emptyHistory();
    this.state = 'idle';
  }

  getState() {
    if (this.response) {
      return this.response?.getState();
    }
    return this.state;
  }

  async interrupt() {
    if (this.response) {
      await this.response.abort();
      this.response = null;
    }
  }

  emptyHistory() {
    return [{ role: 'system', content: this.prompt }];
  }

  changeState(newState) {
    this.state = newState;
  }
}
