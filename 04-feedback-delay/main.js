import { html, render } from 'https://unpkg.com/lit-html';
import 'https://unpkg.com/@ircam/sc-components@latest';

import resumeAudioContext from './lib/resume-audio-context.js';
import loadAudioBuffer from './lib/load-audio-buffer.js';
import FeedbackDelay from './lib/FeedbackDelay.js';

const audioContext = new AudioContext();
await resumeAudioContext(audioContext);

const buffer = await loadAudioBuffer('./assets/sample.wav', audioContext.sampleRate);

const stream = await navigator.mediaDevices.getUserMedia({ audio: {
  echoCancellation: true,
  noiseReduction: false,
  autoGainControl: false,
}});

const mic = audioContext.createMediaStreamSource(stream);

const feedbackDelay = new FeedbackDelay(audioContext, {
  delayTime: 0.2,
  feedback: 0.9,
});

feedbackDelay.output.connect(audioContext.destination);
mic.connect(feedbackDelay.input);

// setInterval(() => {
//   const src = audioContext.createBufferSource();
//   src.connect(feedbackDelay.input);
//   src.buffer = buffer;
//   src.start();
// }, 1000);

render(html`
  <h1>04-feedback-delay</h1>
  <div>
    <sc-text>preGain</sc-text>
    <sc-slider
      value=${feedbackDelay.options.preGain}
      @input=${e => feedbackDelay.setPreGain(e.detail.value)}
      number-box
    ></sc-slider>
  </div>
  <div>
    <sc-text>feedback</sc-text>
    <sc-slider
      value=${feedbackDelay.options.feedback}
      @input=${e => feedbackDelay.setFeedback(e.detail.value)}
      number-box
    ></sc-slider>
  </div>
  <div>
    <sc-text>delayTime</sc-text>
    <sc-slider
      value=${feedbackDelay.options.delayTime}
      @input=${e => feedbackDelay.setPreGain(e.detail.value)}
      number-box
    ></sc-slider>
  </div>
`, document.body);
