const audioContext = new AudioContext();

console.clear();

async function resumeAudioContext() {
  await audioContext.resume();
  console.log('audioContext.state: ', audioContext.state);
}

const button = document.querySelector('#resume-audio-context');
button.addEventListener('click', resumeAudioContext);

function triggerOsc() {
  // create oscillator
  const osc = audioContext.createOscillator();
  const freq = 100 + Math.random() * 900;
  osc.frequency.value = freq;

  const env = audioContext.createGain();
  env.gain.value = 0;
  // pick the context current time in seconds
  const now = audioContext.currentTime;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(0.1, now + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 1);
  // create garph
  osc.connect(env).connect(audioContext.destination);
  // start oscillator
  osc.start(now);
  osc.stop(now + 1);
}

const triggerOscButton = document.querySelector('#trigger-osc');
triggerOscButton.addEventListener('click', triggerOsc);

async function loadAudioBuffer(pathname) {
  const res = await fetch(pathname);
  const buffer = await res.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(buffer);

  return audioBuffer;
}

const audioBuffer = await loadAudioBuffer('./drum-loop.wav');
console.log(audioBuffer);

function triggerBuffer() {
  const src = audioContext.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(audioContext.destination);
  src.start();
}

// const triggerBufferButton = document.querySelector('#trigger-buffer');
// triggerBufferButton.addEventListener('click', triggerBuffer);
