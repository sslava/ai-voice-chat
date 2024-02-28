module.exports = class DialogChunks {
  constructor() {
    this.text = '';
    this.phrase = '';
    this.min_length = 40;
  }

  /**
   * @param {string} delta
   */
  push(delta) {
    this.text += delta;
    this.phrase += delta;
  }

  phrase_complete() {
    const last = this.phrase.slice(-1);
    return (
      (last === '.' || last === '?') && this.phrase.length > this.min_length
    );
  }

  pop() {
    const current = this.phrase;
    this.phrase = '';
    return current;
  }
};
