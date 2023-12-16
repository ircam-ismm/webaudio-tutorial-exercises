import { html, render } from 'https://unpkg.com/lit-html';
import 'https://unpkg.com/@ircam/sc-components@latest';

import resumeAudioContext from './lib/resume-audio-context.js';

const audioContext = new AudioContext();
await resumeAudioContext(audioContext);


const modDepth = 0.4;
const carrierFrequency = 200;
const modFrequency = 2;

const carrier = audioContext.createOscillator();
carrier.frequency.value = carrierFrequency;

const envelop = audioContext.createGain();
envelop.gain.value = 1 - modDepth / 2;

carrier.connect(envelop);
envelop.connect(audioContext.destination);

// modulating branch
const modulator = audioContext.createOscillator();
modulator.frequency.value = modFrequency;

const depth = audioContext.createGain();
depth.gain.value = modDepth / 2;

modulator.connect(depth);
depth.connect(envelop.gain);


carrier.start();
modulator.start();

render(html`
  <h1>03-amplitude-modulation</h1>

  <div>
    <sc-text>carrier frequency</sc-text>
    <sc-slider
      max="1000"
      min="50"
      value=${carrierFrequency}
      @input=${function (e) {
        carrier.frequency.value = e.detail.value;
      }}
      number-box
    ></sc-slider>
  </div>
  <div>
    <sc-text>mod frequency</sc-text>
    <sc-slider
      max="1000"
      min="0"
      value=${modFrequency}
      @input=${function (e) {
        modulator.frequency.value = e.detail.value;
      }}
      number-box
    ></sc-slider>
  </div>
    <div>
    <sc-text>mod depth</sc-text>
    <sc-slider
      max="1"
      min="0"
      value=${modDepth}
      @input=${function (e) {
        envelop.gain.value = 1 - e.detail.value / 2;
        depth.gain.value = e.detail.value / 2;
      }}
      number-box
    ></sc-slider>
  </div>



`, document.body);









