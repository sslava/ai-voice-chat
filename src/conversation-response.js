const DialogChunks = require('./dialog-chunks');
const ConversationVoice = require('./voice');


/**
 * Represents a conversation response.
 * @class
 */
module.exports = class ConversationResponse {
  /**
   * @param {AIWrapper} ai - The AI wrapper object.
   * @param {Array} history - The conversation history.
   */
  constructor(ai, history) {
    this.ai = ai;
    this.voice = new ConversationVoice(ai);

    this.history = history;
    this.aborted = false;
  }

  /**
   * Starts the conversation with user speech.
   * @param {string} speech - The user's speech.
   */
  async start(speech) {
    if (this.isAborted()) {
      return;
    }

    const text = await this.ai.whisper(speech);
    console.log('user: ', text);

    if (!text) {
      return;
    }
    this.history.push({ role: 'user', content: text });
    if (this.isAborted()) {
      return;
    }
    await this.processCompletion();
  }

  async processCompletion() {
    const completion = await this.ai.completion(this.history);
    if (this.isAborted()) {
      return;
    }

    const chunks = new DialogChunks();
    let index = 0;
    for await (const chunk of completion) {
      if (this.isAborted()) {
        return;
      }

      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        chunks.push(delta);
        if (chunks.phraseComplete()) {
          const sentence = chunks.pop();
          this.voice.say(sentence, index++);
        }
      }
    }
    if (this.isAborted()) {
      return;
    }

    if (chunks.phrase !== '') {
      const sentence = chunks.pop();
      this.voice.say(sentence, index++);
    }
    this.history.push({ role: 'assistant', content: chunks.text });
  }

  isAborted() {
    if (this.aborted) {
      console.log('conversation: aborted');
    }
    return this.aborted;
  }

  /**
   * Aborts the conversation.
   */
  async abort() {
    console.log('conversation: aborting...');
    await this.voice.abort();
    this.aborted = true;
  }

  getState() {
    const state = this.voice.getState();
    if (state) {
      return state;
    }
    return 'waiting'
  }
};
