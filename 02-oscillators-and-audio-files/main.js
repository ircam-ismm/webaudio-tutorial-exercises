const audioContext = new AudioContext();

async function resumeAudioContext() {
  await audioContext.resume();
  button.remove();
}

const button = document.querySelector('#resume-audio-context');
button.addEventListener('click', resumeAudioContext);

function triggerSine() {
  // const numPartials = 10;

  // for (let i = 1; i <= numPartials; i++) {
    // create oscillator
    const osc = audioContext.createOscillator();
    const freq = (Math.random() * 900 + 100);
    osc.frequency.value = freq;

    const now = audioContext.currentTime;
    const env = audioContext.createGain();
    env.gain.value = 0;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.1, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1);

    // osc.connect(audioContext.destination);
    osc.connect(env);
    env.connect(audioContext.destination);
    // demarrer l'oscillator
    osc.start(now);
    osc.stop(now + 1);
  // }

  // setTimeout(() => triggerSine(), 50);
}


const triggerSyncButton = document.querySelector('#trigger-sine');
triggerSyncButton.addEventListener('click', triggerSine);

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

const triggerBufferButton = document.querySelector('#trigger-buffer');
triggerBufferButton.addEventListener('click', triggerBuffer);

