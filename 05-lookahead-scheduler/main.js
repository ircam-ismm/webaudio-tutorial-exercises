import { html, render } from 'https://unpkg.com/lit-html';
import 'https://unpkg.com/@ircam/sc-components@latest';

import resumeAudioContext from './lib/resume-audio-context.js';
import loadAudioBuffer from './lib/load-audio-buffer.js';

const audioContext = new AudioContext();
await resumeAudioContext(audioContext);

const buffer = await loadAudioBuffer('./assets/sample.wav', audioContext.sampleRate);


class PriorityQueue {
  constructor() {
    this.stack = []; // contains all (time, func) pairs
  }

  add(time, func) {
    const event = { time, func };
    this.stack.push(event);
    this.stack.sort((a, b) => {
      if (a.time < b.time) {
        return -1;
      } else if (a.time > b.time) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  // return the closest element in time
  head() {
    return this.stack[0];
  }

  // delete the closest element in time
  deleteHead() {
    this.stack.shift();
  }
}

// test the priority queue
// const priorityQueue = new PriorityQueue();
// priorityQueue.add(2, () => {});
// priorityQueue.add(1, () => {});
// priorityQueue.add(3, () => {});

// console.log(priorityQueue.head()); // { time: 1, func: () => {} }
// priorityQueue.deleteHead();
// console.log(priorityQueue.head()); // { time: 2, func: () => {} }

class Scheduler {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.priorityQueue = new PriorityQueue();
    this.period = 0.05;
    this.lookahead = 0.1;

    this.tick();
  }

  add(time, func) {
    this.priorityQueue.add(time, func);
  }

  // called at every `period` delay
  tick() {
    const now = this.audioContext.currentTime;
    let event = this.priorityQueue.head();

    while (event && event.time < now + this.lookahead) {
      const time = event.time;
      const func = event.func;

      const nextTime = func(time);

      this.priorityQueue.deleteHead();

      if (nextTime) {
        this.priorityQueue.add(nextTime, func);
      }

      event = this.priorityQueue.head();
    }

    setTimeout(() => this.tick(), this.period * 1000); // time in ms
  }
}

const BPM = 5000;

function metro(audioTime) {
  console.log(audioTime);
  const src = audioContext.createBufferSource();
  src.connect(audioContext.destination);
  src.buffer = buffer;
  src.start(audioTime);

  return audioTime + 60 / BPM;
}

const scheduler = new Scheduler(audioContext);
scheduler.add(audioContext.currentTime, metro);

render(html`
  <h1>05-lookahead-scheduler</h1>
`, document.body);
