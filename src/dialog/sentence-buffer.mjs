export default class SentenceBuffer {
  text = '';
  sentence = '';
  min_length = 40;

  push(delta) {
    this.text += delta;
    this.sentence += delta;
  }

  hasCompleteSentence() {
    const last = this.sentence.slice(-1);
    return (
      (last === '.' || last === '?') && this.sentence.length > this.min_length
    );
  }

  popSentence() {
    const current = this.sentence;
    this.sentence = '';
    return current;
  }
}
