import { html, render } from 'https://unpkg.com/lit-html';
import { Scheduler } from 'https://unpkg.com/@ircam/sc-scheduling@latest';
import 'https://unpkg.com/@ircam/sc-components@latest';

import resumeAudioContext from './lib/resume-audio-context.js';
import loadAudioBuffer from './lib/load-audio-buffer.js';

const audioContext = new AudioContext();
await resumeAudioContext(audioContext);

const buffer = await loadAudioBuffer('./assets/hendrix.wav', audioContext.sampleRate);

class GranularSynth {
  constructor(audioContext, buffer) {
    this.audioContext = audioContext;
    this.buffer = buffer;

    this.period = 0.01;
    this.duration = 0.1;
    this.position = 0;

    this.output = this.audioContext.createGain();
    this.render = this.render.bind(this);
  }

  render(currentTime) {
    const jitter = Math.random() * 0.002;
    const audioTime = currentTime + jitter;

    const env = this.audioContext.createGain();
    env.connect(this.output);
    env.gain.value = 0;
    env.gain.setValueAtTime(0, audioTime);
    env.gain.linearRampToValueAtTime(1, audioTime + this.duration / 2);
    env.gain.linearRampToValueAtTime(0, audioTime + this.duration);

    const src = this.audioContext.createBufferSource();
    src.connect(env);
    src.buffer = this.buffer;
    // src.detune.value = Math.random() * 1200 - 600;
    // src.detune.value = -1200;
    // src.playbackRate = 0.5;

    src.start(audioTime, this.position);
    src.stop(audioTime + this.duration);

    return currentTime + this.period;
  }
}

const scheduler = new Scheduler(() => audioContext.currentTime);
const granular = new GranularSynth(audioContext, buffer);
granular.output.connect(audioContext.destination);

scheduler.add(granular.render, audioContext.currentTime);

render(html`
  <h1>06-granular-synthesis</h1>
  <div>
    <sc-text>period</sc-text>
    <sc-slider
      min="0.004"
      max="0.1"
      value=${granular.period}
      @input=${e => granular.period = e.detail.value}
      number-box
    ></sc-slider>
  </div>
  <div>
    <sc-text>duration</sc-text>
    <sc-slider
      min="0.02"
      max="0.2"
      value=${granular.duration}
      @input=${e => granular.duration = e.detail.value}
      number-box
    ></sc-slider>
  </div>
  <div>
    <sc-text>position</sc-text>
    <sc-slider
      min="0"
      max=${buffer.duration}
      value=${granular.position}
      @input=${e => granular.position = e.detail.value}
      number-box
    ></sc-slider>
  </div>
  <sc-dragndrop></sc-dragndrop>
  <sc-midi></sc-midi>
`, document.body);
