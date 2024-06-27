import EventEmitter from 'node:events';

import { Dialog } from './dialog.mjs';

export class DialogManager extends EventEmitter {
  /**
   * @param {string} prompt system prompt
   */
  constructor(prompt) {
    super();
    this.dialog = new Dialog(prompt);

    this.on('listen', () => {
      this.dialog.listen();
    });
    this.on('respond', () => {
      this.dialog.respond();
    });
    this.on('bye', () => {
      this.dialog.bye();
    });
    this.on('greetings', () => {
      this.dialog.greetings();
    });
  }

  getState() {
    return this.dialog.getState();
  }

  greetings() {
    this.emit('greetings');
  }

  listen() {
    this.emit('listen');
  }

  respond() {
    this.emit('respond');
  }

  bye() {
    this.emit('bye');
  }
}
