const AIWrapper = require('./aiwrapper');
const MicManager = require('./mic');
const ConversationResponse = require('./conversation-response');

module.exports = class Conversation {
  constructor(systemPrompt) {
    this.systemPrompt = systemPrompt;
    this.mic = new MicManager();
    this.ai = new AIWrapper();
    this.history = [{ role: 'system', content: this.systemPrompt }];
    this.response = null;
    this.state = 'idle';
  }

  async startListening() {
    if (this.mic.isStarted()) {
      return;
    }
    await this.abortResponse();
    this.mic.start();
    this.state = 'listening';
  }

  async startResponding() {
    if (!this.mic.isStarted()) {
      return;
    }
    const stream = this.mic.stop();

    this.response = new ConversationResponse(this.ai, this.history);
    await this.response.start(stream);
  }

  async abortResponse() {
    if (this.response) {
      await this.response.abort();
      this.response = null;
    }
  }

  async clear() {
    await this.abortResponse();
    this.history = [{ role: 'system', content: this.systemPrompt }];
    this.state = 'idle';
  }

  getState() {
    if (this.response) {
      return this.response.getState();
    }
    return this.state;
  }
};
