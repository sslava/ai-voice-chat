const AIWrapper = require('./aiwrapper');
const MicManager = require('./mic');
const ConversationResponse = require('./conversation-response');

module.exports = class Conversation {
  constructor(system_prompt) {
    this.system_prompt = system_prompt;
    this.mic = new MicManager();
    this.ai = new AIWrapper();
    this.history = [{ role: 'system', content: this.system_prompt }];
    this.response = null;
  }

  async start_listening() {
    if (this.mic.isStarted()) {
      return;
    }
    await this.abort_response();
    this.mic.start();
  }

  async start_responding() {
    if (!this.mic.isStarted()) {
      return;
    }
    const stream = this.mic.stop();

    this.response = new ConversationResponse(this.ai, this.history);
    await this.response.start(stream);
  }

  async abort_response() {
    if (this.response) {
      await this.response.abort();
      this.response = null;
    }
  }

  async clear() {
    await this.abort_response();
    this.history = [{ role: 'system', content: this.system_prompt }];
  }
};
