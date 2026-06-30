// Web Audio API Sound Synthesizer for Call of Nature
let audioCtx: AudioContext | null = null;
let currentLoopInterval: number | null = null;
let masterVolumeNode: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch((err) => {
        console.warn("AudioContext resume failed or suspended:", err);
      });
    }
  } catch (err) {
    console.warn("AudioContext setup is blocked or unsupported in this sandbox frame:", err);
    return null;
  }
  return audioCtx;
}

export function initAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx && !masterVolumeNode) {
      masterVolumeNode = ctx.createGain();
      masterVolumeNode.gain.setValueAtTime(0.5, ctx.currentTime);
      masterVolumeNode.connect(ctx.destination);
    }
  } catch (err) {
    console.warn("initAudio failed inside sandbox frame:", err);
  }
}

export function setMasterVolume(pct: number) {
  initAudio();
  if (masterVolumeNode && audioCtx) {
    masterVolumeNode.gain.setValueAtTime(pct, audioCtx.currentTime);
  }
}

export function playSound(type: "select" | "jump" | "collect" | "zap" | "water" | "net" | "shutter" | "bosshit" | "victory" | "failure" | "unlock") {
  const ctx = getAudioContext();
  if (!ctx) return;
  initAudio();

  const dest = masterVolumeNode || ctx.destination;

  try {
    switch (type) {
      case "select": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(dest);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
        break;
      }
      case "jump": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(dest);
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
        break;
      }
      case "collect": {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(dest);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        
        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 overtones
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        
        osc.start();
        osc2.start();
        osc.stop(ctx.currentTime + 0.25);
        osc2.stop(ctx.currentTime + 0.25);
        break;
      }
      case "zap": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(dest);
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
        break;
      }
      case "water": {
        // white noise / sizzling water effect
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1000;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        
        noise.start();
        noise.stop(ctx.currentTime + 0.16);
        break;
      }
      case "net": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(dest);
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.18);
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.19);
        break;
      }
      case "shutter": {
        // High frequency brief click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(dest);
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(2000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
        break;
      }
      case "bosshit": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(dest);
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, ctx.currentTime + 0.35);
        
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
        break;
      }
      case "victory": {
        const notes = [261.63, 329.63, 392.00, 523.25]; // C major arpeggio
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(dest);
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.4);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
        });
        break;
      }
      case "failure": {
        const notes = [220.00, 207.65, 196.00]; // descending sadness
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(dest);
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.15 + 0.3);
          osc.start(ctx.currentTime + idx * 0.15);
          osc.stop(ctx.currentTime + idx * 0.15 + 0.32);
        });
        break;
      }
      case "unlock": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(dest);
        osc.type = "sine";
        osc.frequency.setValueAtTime(392.00, ctx.currentTime); // G
        osc.frequency.setValueAtTime(587.33, ctx.currentTime + 0.08); // D
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
        break;
      }
    }
  } catch (err) {
    console.warn("Could not generate procedural sound in standard Web Audio API:", err);
  }
}

export function startMusicLoop(type: "menu" | "game" | "final") {
  stopMusicLoop();
  const ctx = getAudioContext();
  if (!ctx) return;
  initAudio();

  const dest = masterVolumeNode || ctx.destination;

  let step = 0;
  let tempo = type === "final" ? 140 : type === "game" ? 120 : 90;
  let bpmDelay = 60 / tempo / 2; // eighth notes

  const notesMenu = [261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66]; // Pentatonic scale loop
  const notesGame = [220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
  const notesFinal = [196.00, 220.00, 233.08, 261.63, 293.66, 311.13, 392.00, 440.00]; // minor keys

  const playBeat = () => {
    try {
      const now = ctx.currentTime;
      let notes = notesMenu;
      let oscType: OscillatorType = "sine";
      let amp = 0.03;

      if (type === "game") {
        notes = notesGame;
        oscType = "triangle";
        amp = 0.04;
      } else if (type === "final") {
        notes = notesFinal;
        oscType = "sawtooth";
        amp = 0.025;
      }

      // Bass note on downbeats
      if (step % 4 === 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.connect(bassGain);
        bassGain.connect(dest);
        bassOsc.type = "sine";
        // root note 2 octaves down
        bassOsc.frequency.setValueAtTime(notes[step % 4] / 4, now);
        bassGain.gain.setValueAtTime(amp * 1.5, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + bpmDelay * 3);
        bassOsc.start(now);
        bassOsc.stop(now + bpmDelay * 3);
      }

      // Melodic note
      const melOsc = ctx.createOscillator();
      const melGain = ctx.createGain();
      melOsc.connect(melGain);
      melGain.connect(dest);
      melOsc.type = oscType;
      
      const targetNote = notes[step % notes.length];
      melOsc.frequency.setValueAtTime(targetNote, now);
      melGain.gain.setValueAtTime(amp, now);
      melGain.gain.exponentialRampToValueAtTime(0.001, now + bpmDelay * 0.9);
      melOsc.start(now);
      melOsc.stop(now + bpmDelay * 0.9);

      step++;
    } catch (e) {
      console.warn("Audio Context Loop Error", e);
    }
  };

  currentLoopInterval = window.setInterval(playBeat, bpmDelay * 1000);
}

export function stopMusicLoop() {
  if (currentLoopInterval) {
    clearInterval(currentLoopInterval);
    currentLoopInterval = null;
  }
}
