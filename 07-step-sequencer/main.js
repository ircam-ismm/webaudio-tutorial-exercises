import { html, render } from 'https://unpkg.com/lit-html';
import { Scheduler } from 'https://unpkg.com/@ircam/sc-scheduling@latest';
import 'https://unpkg.com/@ircam/sc-components@latest';

import resumeAudioContext from './lib/resume-audio-context.js';
import loadAudioBuffer from './lib/load-audio-buffer.js';

const audioContext = new AudioContext();
await resumeAudioContext(audioContext);

const files = [
  './assets/hh.wav',
  './assets/clap.wav',
  './assets/rimshot.wav',
  './assets/snare.wav',
  './assets/kick.wav',
];

const buffers = [];

for (let i = 0; i < files.length; i++) {
  const filename = files[i];
  const buffer = await loadAudioBuffer(filename, audioContext.sampleRate);
  buffers[i] = buffer;
}

const numSteps = 16;
const BPM = 180;

const score = [
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], // "hh" track
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1], // "clap" track
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // "rimshot" track
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], // "snare" track
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // "kick" track
];

// const score = [];

// for (let i = 0; i < buffers.length; i++) {
//   const track = [];

//   for (let j = 0; j < numSteps; j++) {
//     // track.push(0);
//     track[j] = 0;
//   }

//   // score.push(track);
//   score[i] = track;
// }

// console.log(score);

class TrackPlayer {
  constructor(audioContext, buffer, track, BPM, numSteps) {
    this.audioContext = audioContext;
    this.buffer = buffer;
    this.track = track;
    this.BPM = BPM;
    this.step = 0;
    this.numSteps = numSteps;

    this.output = this.audioContext.createGain();
    this.render = this.render.bind(this);
  }

  connect(audioNode) {
    this.output.connect(audioNode);
  }

  render(currentTime) {
    const gain = this.track[this.step] ;

    if (gain !== 0) {
      const env = this.audioContext.createGain();
      env.connect(this.output);
      env.gain.value = gain;

      const src = this.audioContext.createBufferSource();
      src.connect(env);
      src.buffer = this.buffer;
      src.start(currentTime);
    }

    this.step = (this.step + 1) % this.numSteps;

    return currentTime + 60 / this.BPM;
  }
}

const scheduler = new Scheduler(() => audioContext.currentTime);

const tracks = [];
const startTime = audioContext.currentTime + 0.2;

for (let i = 0; i < score.length; i++) {
  const track = score[i];
  const buffer = buffers[i];

  const panner = audioContext.createStereoPanner();
  panner.pan.value = Math.random() * 2 - 1;
  panner.connect(audioContext.destination);

  const trackPlayer = new TrackPlayer(audioContext, buffer, track, BPM, numSteps);
  trackPlayer.connect(panner);

  scheduler.add(trackPlayer.render, startTime);
}

render(html`
  <h1>07-step-sequencer</h1>
  <sc-matrix
    style="width: 600px; height: 400px;"
    .value=${score}
    .states=${[0, 0.5, 1]}
  ></sc-matrix>
`, document.body);
