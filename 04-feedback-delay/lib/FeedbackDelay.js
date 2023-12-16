
class FeedbackDelay {
  constructor(audioContext, options = {}) {
    this.audioContext = audioContext;

    const defaults = {
      preGain: 0.7,
      delayTime: 0.2,
      feedback: 0.9,
      maxDelay: 1, // max delayTime in seconds
    };

    this.options = Object.assign(defaults, options);

    this.input = this.audioContext.createGain();
    this.output = this.audioContext.createGain();

    this.input.connect(this.output);

    this.preGain = this.audioContext.createGain();
    this.preGain.gain.value = this.options.preGain;

    this.delay = this.audioContext.createDelay(this.options.maxDelay);
    this.delay.delayTime.value = this.options.delayTime;

    this.feedback = this.audioContext.createGain();
    this.feedback.gain.value = this.options.feedback;

    this.input.connect(this.preGain);
    this.preGain.connect(this.delay);
    this.delay.connect(this.output);
    this.delay.connect(this.feedback);
    this.feedback.connect(this.delay);
  }

  setPreGain(value) {
    const currentTime = this.audioContext.currentTime;
    const timeConstant = 0.005;
    this.preGain.gain.setTargetAtTime(value, currentTime, timeConstant);
  }

  setDelayTime(value) {
    const currentTime = this.audioContext.currentTime;
    const timeConstant = 0.005;
    this.delay.delayTime.setTargetAtTime(value, currentTime, timeConstant);
  }

  setFeedback(value) {
    const currentTime = this.audioContext.currentTime;
    const timeConstant = 0.005;
    this.feedback.gain.setTargetAtTime(value, currentTime, timeConstant);
  }
}

export default FeedbackDelay;
