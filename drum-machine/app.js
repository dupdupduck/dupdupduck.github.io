/**
 * BEAT FARM — Single Page Drum Machine & Beat Maker
 * Web Audio API Algorithmic Percussion Synthesizer & 16-Step Sequencer
 * Pure JavaScript • No external assets • Zero dependencies
 */

'use strict';

// ============================================================================
// 1. Web Audio API Percussion Synthesizer
// ============================================================================
class SynthEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.limiter = null;
    this.noiseBuffer = null;
    this.volume = 0.8;
    this.isMuted = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    // Dynamics Compressor (Master Limiter) to ensure crystal clear sound without clipping
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-1.5, this.ctx.currentTime);
    this.limiter.knee.setValueAtTime(8, this.ctx.currentTime);
    this.limiter.ratio.setValueAtTime(14, this.ctx.currentTime);
    this.limiter.attack.setValueAtTime(0.002, this.ctx.currentTime);
    this.limiter.release.setValueAtTime(0.08, this.ctx.currentTime);

    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.ctx.destination);

    // Pre-render 2 seconds of high quality white noise for snares, cymbals, claps & shakers
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const channelData = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      channelData[i] = Math.random() * 2 - 1;
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(fraction) {
    this.volume = Math.max(0, Math.min(1, fraction));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      const targetVol = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(targetVol, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // --- Sound Synthesizers ---

  // 1. Kick: Punchy acoustic/electronic kick with sine drop and click transient
  playKick(time = this.ctx.currentTime) {
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.08);
    osc.frequency.exponentialRampToValueAtTime(20, time + 0.32);

    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.36);

    // Punch click transient
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'sine';
    click.frequency.setValueAtTime(320, time);
    click.frequency.exponentialRampToValueAtTime(40, time + 0.015);
    clickGain.gain.setValueAtTime(0.45, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
    click.connect(clickGain);
    clickGain.connect(this.masterGain);
    click.start(time);
    click.stop(time + 0.016);
  }

  // 2. Snare: Resonant body tone + snappy white noise burst
  playSnare(time = this.ctx.currentTime) {
    this.ensureContext();
    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(85, time + 0.07);
    oscGain.gain.setValueAtTime(0.65, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.13);

    // Snare wires (noise)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1100, time);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.75, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.23);
  }

  // 3. Hi-Hat: Crisp high-passed metallic sizzle, tight decay
  playHiHat(time = this.ctx.currentTime) {
    this.ensureContext();
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7800, time);
    filter.Q.setValueAtTime(2.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.05);
  }

  // 4. Clap: Multi-burst noise pulses followed by smooth room decay
  playClap(time = this.ctx.currentTime) {
    this.ensureContext();
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1150, time);
    filter.Q.setValueAtTime(2.0, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.02, time + 0.01);
    gain.gain.setValueAtTime(0.7, time + 0.011);
    gain.gain.exponentialRampToValueAtTime(0.02, time + 0.021);
    gain.gain.setValueAtTime(0.9, time + 0.022);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.23);
  }

  // 5. Tom: Resonant acoustic pitch sweep
  playTom(time = this.ctx.currentTime) {
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(175, time);
    osc.frequency.exponentialRampToValueAtTime(65, time + 0.22);
    gain.gain.setValueAtTime(0.85, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.29);
  }

  // 6. Rim: Sharp resonant wooden stick click
  playRim(time = this.ctx.currentTime) {
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, time);
    osc.frequency.exponentialRampToValueAtTime(420, time + 0.025);
    oscGain.gain.setValueAtTime(0.8, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.04);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, time);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.02);
  }

  // 7. Crash: Long decaying metallic wash with high-pass shimmer
  playCrash(time = this.ctx.currentTime) {
    this.ensureContext();
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3800, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 1.21);

    // Shimmer tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, time);
    oscGain.gain.setValueAtTime(0.12, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.81);
  }

  // 8. Cowbell: Classic Roland TR-808 dual square oscillators
  playCowbell(time = this.ctx.currentTime) {
    this.ensureContext();
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'square';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(540, time);
    osc2.frequency.setValueAtTime(800, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850, time);
    filter.Q.setValueAtTime(3.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.26);
    osc2.stop(time + 0.26);
  }

  // 9. Open Hat: Sizzling metallic noise with open decay
  playOpenHat(time = this.ctx.currentTime) {
    this.ensureContext();
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, time);
    filter.Q.setValueAtTime(2.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.39);
  }

  // 10. Shaker: Smooth attack maraca/shaker puff
  playShaker(time = this.ctx.currentTime) {
    this.ensureContext();
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(5500, time);
    filter.Q.setValueAtTime(2.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.55, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.075);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.08);
  }

  // 11. Kick 2: Deep 808 Sub Kick with sustained sub boom
  playKick2(time = this.ctx.currentTime) {
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.1);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.65);

    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.68);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.7);
  }

  // 12. Snare 2: Snappy modern Trap Snare with bright sizzle
  playSnare2(time = this.ctx.currentTime) {
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, time);
    osc.frequency.exponentialRampToValueAtTime(130, time + 0.05);
    oscGain.gain.setValueAtTime(0.65, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.11);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2800, time);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.85, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.17);
  }

  // 13. Perc: Dry woodblock knock / clave
  playPerc(time = this.ctx.currentTime) {
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1650, time);
    osc.frequency.exponentialRampToValueAtTime(1200, time + 0.015);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.045);
  }

  // 14. Bass: Chunky synth sub hit with resonant filter dive
  playBass(time = this.ctx.currentTime) {
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, time); // A1 note

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, time);
    filter.frequency.exponentialRampToValueAtTime(110, time + 0.35);
    filter.Q.setValueAtTime(3.0, time);

    gain.gain.setValueAtTime(0.95, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.46);
  }

  // 15. FX: Sci-fi laser zap drop
  playFx(time = this.ctx.currentTime) {
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, time);
    filter.Q.setValueAtTime(4.0, time);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.23);
  }

  // 16. Vocal chop: Stylized electronic formant vowel hit ("Hey!")
  playVocal(time = this.ctx.currentTime) {
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, time);
    osc.frequency.exponentialRampToValueAtTime(215, time + 0.15);

    // Formant filter 1 (~750Hz)
    const f1 = this.ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(750, time);
    f1.Q.setValueAtTime(4.0, time);

    // Formant filter 2 (~1350Hz)
    const f2 = this.ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(1350, time);
    f2.Q.setValueAtTime(4.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.85, time + 0.015);
    gain.gain.setValueAtTime(0.85, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);

    osc.connect(f1);
    osc.connect(f2);
    f1.connect(gain);
    f2.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  // Universal trigger method by sound ID
  play(soundId, time) {
    const t = time || (this.ctx ? this.ctx.currentTime : 0);
    switch (soundId) {
      case 'kick': this.playKick(t); break;
      case 'snare': this.playSnare(t); break;
      case 'hihat': this.playHiHat(t); break;
      case 'clap': this.playClap(t); break;
      case 'tom': this.playTom(t); break;
      case 'rim': this.playRim(t); break;
      case 'crash': this.playCrash(t); break;
      case 'cowbell': this.playCowbell(t); break;
      case 'openhat': this.playOpenHat(t); break;
      case 'shaker': this.playShaker(t); break;
      case 'kick2': this.playKick2(t); break;
      case 'snare2': this.playSnare2(t); break;
      case 'perc': this.playPerc(t); break;
      case 'bass': this.playBass(t); break;
      case 'fx': this.playFx(t); break;
      case 'vocal': this.playVocal(t); break;
      default: console.warn('Unknown sound id:', soundId);
    }
  }
}

// ============================================================================
// 2. Application State & Sequencer Engine
// ============================================================================
class BeatFarmApp {
  constructor() {
    this.soundEngine = new SynthEngine();

    // Sequencer state
    this.isPlaying = false;
    this.bpm = 120;
    this.totalSteps = 16;
    this.currentStep = 0;

    // 4 Tracks: Kick, Snare, Hi-Hat, Clap
    this.tracks = ['kick', 'snare', 'hihat', 'clap'];
    this.pattern = {
      kick: new Array(this.totalSteps).fill(false),
      snare: new Array(this.totalSteps).fill(false),
      hihat: new Array(this.totalSteps).fill(false),
      clap: new Array(this.totalSteps).fill(false)
    };

    // Web Audio scheduler lookahead queue
    this.lookaheadMs = 25.0;
    this.scheduleAheadSec = 0.1;
    this.nextNoteTime = 0.0;
    this.schedulerTimer = null;
    this.notesInQueue = [];
    this.animFrameId = null;
    this.lastDrawnStep = -1;

    // Presets definition
    this.presets = {
      boombap: {
        bpm: 90,
        pattern: {
          kick:  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
          snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          clap:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
        }
      },
      trap: {
        bpm: 140,
        pattern: {
          kick:  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
          snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
          hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          clap:  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
        }
      },
      house: {
        bpm: 124,
        pattern: {
          kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
          snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
          clap:  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
        }
      }
    };

    // Cache DOM Elements
    this.dom = {
      playBtn: document.getElementById('playBtn'),
      playBtnText: document.getElementById('playBtnText'),
      iconPlay: document.querySelector('.icon-play'),
      iconStop: document.querySelector('.icon-stop'),
      clearBtn: document.getElementById('clearBtn'),
      statusIndicator: document.getElementById('statusIndicator'),
      statusText: document.getElementById('statusText'),
      bpmSlider: document.getElementById('bpmSlider'),
      bpmDisplay: document.getElementById('bpmDisplay'),
      bpmMinus: document.getElementById('bpmMinus'),
      bpmPlus: document.getElementById('bpmPlus'),
      volumeSlider: document.getElementById('volumeSlider'),
      volumeDisplay: document.getElementById('volumeDisplay'),
      muteBtn: document.getElementById('muteBtn'),
      iconVolume: document.getElementById('iconVolume'),
      iconMuted: document.getElementById('iconMuted'),
      stepNumbersHeader: document.getElementById('stepNumbersHeader'),
      trackStepsContainers: document.querySelectorAll('.track-steps'),
      drumPads: document.querySelectorAll('.drum-pad'),
      presetButtons: document.querySelectorAll('.btn-preset'),
      auditionButtons: document.querySelectorAll('.btn-audition')
    };

    this.stepButtons = {
      kick: [],
      snare: [],
      hihat: [],
      clap: []
    };
    this.stepHeaderCells = [];
  }

  // ============================================================================
  // 3. Initialization & DOM Generation
  // ============================================================================
  init() {
    this.buildSequencerHeader();
    this.buildSequencerGrid();
    this.bindEvents();
    this.bindKeyboardShortcuts();
    this.updateBpmDisplay();
    this.updateVolumeDisplay();

    // Load House preset by default for immediate fun
    this.loadPreset('house');
  }

  buildSequencerHeader() {
    this.dom.stepNumbersHeader.innerHTML = '';
    this.stepHeaderCells = [];

    for (let i = 0; i < this.totalSteps; i++) {
      const cell = document.createElement('div');
      cell.className = 'step-num';
      cell.textContent = i + 1;
      // Mark beats 1, 5, 9, 13
      if (i % 4 === 0) {
        cell.classList.add('is-downbeat');
      }
      this.dom.stepNumbersHeader.appendChild(cell);
      this.stepHeaderCells.push(cell);
    }
  }

  buildSequencerGrid() {
    this.tracks.forEach(track => {
      const container = document.querySelector(`.track-steps[data-track="${track}"]`);
      if (!container) return;
      container.innerHTML = '';
      this.stepButtons[track] = [];

      for (let step = 0; step < this.totalSteps; step++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'step-btn';
        btn.dataset.track = track;
        btn.dataset.step = step;
        btn.setAttribute('aria-label', `${track} bước ${step + 1}`);

        // Visual rhythm groupings: beats 2 (5-8) and 4 (13-16)
        if (Math.floor(step / 4) % 2 === 1) {
          btn.classList.add('beat-group-alt');
        }

        // Toggle step on click
        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.soundEngine.ensureContext();
          this.toggleStep(track, step);
        });

        container.appendChild(btn);
        this.stepButtons[track].push(btn);
      }
    });
  }

  toggleStep(track, step) {
    const newState = !this.pattern[track][step];
    this.pattern[track][step] = newState;
    const btn = this.stepButtons[track][step];
    if (newState) {
      btn.classList.add('is-active');
      // If stopped, audition sound on toggle
      if (!this.isPlaying) {
        this.soundEngine.play(track);
        this.flashPad(track);
      }
    } else {
      btn.classList.remove('is-active');
    }
    this.clearPresetActiveStyle();
  }

  // ============================================================================
  // 4. Sequencer Playback & Web Audio Timeline Scheduler
  // ============================================================================
  togglePlay() {
    this.soundEngine.ensureContext();
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;
    this.notesInQueue = [];
    this.nextNoteTime = this.soundEngine.ctx.currentTime + 0.05;

    // UI Updates
    this.dom.playBtn.classList.add('is-playing');
    this.dom.playBtnText.textContent = 'Dừng';
    this.dom.iconPlay.style.display = 'none';
    this.dom.iconStop.style.display = 'block';

    this.dom.statusIndicator.classList.add('is-playing');
    this.dom.statusText.textContent = 'Đang phát';

    // Start timer & animation loop
    this.schedulerTimer = setInterval(() => this.scheduleNotes(), this.lookaheadMs);
    this.requestDraw();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    clearInterval(this.schedulerTimer);
    this.schedulerTimer = null;
    cancelAnimationFrame(this.animFrameId);
    this.animFrameId = null;

    // Reset Playhead UI
    this.clearPlayheadHighlight();
    this.lastDrawnStep = -1;

    // UI Updates
    this.dom.playBtn.classList.remove('is-playing');
    this.dom.playBtnText.textContent = 'Phát';
    this.dom.iconPlay.style.display = 'block';
    this.dom.iconStop.style.display = 'none';

    this.dom.statusIndicator.classList.remove('is-playing');
    this.dom.statusText.textContent = 'Sẵn sàng';
  }

  scheduleNotes() {
    // Look ahead and queue any notes due within scheduleAheadSec
    while (this.nextNoteTime < this.soundEngine.ctx.currentTime + this.scheduleAheadSec) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.advanceStep();
    }
  }

  scheduleStep(stepIndex, time) {
    const triggeredTracks = [];

    this.tracks.forEach(track => {
      if (this.pattern[track][stepIndex]) {
        this.soundEngine.play(track, time);
        triggeredTracks.push(track);
      }
    });

    // Record for visual sync
    this.notesInQueue.push({
      step: stepIndex,
      time: time,
      tracks: triggeredTracks
    });
  }

  advanceStep() {
    // 16th note duration = (60 / BPM) / 4 = 15 / BPM seconds
    const secondsPer16th = 15.0 / this.bpm;
    this.nextNoteTime += secondsPer16th;
    this.currentStep = (this.currentStep + 1) % this.totalSteps;
  }

  requestDraw() {
    this.animFrameId = requestAnimationFrame(() => {
      this.drawPlayhead();
      if (this.isPlaying) {
        this.requestDraw();
      }
    });
  }

  drawPlayhead() {
    const currentTime = this.soundEngine.ctx ? this.soundEngine.ctx.currentTime : 0;
    let currentStepToDraw = this.lastDrawnStep;

    while (this.notesInQueue.length && this.notesInQueue[0].time <= currentTime) {
      const item = this.notesInQueue.shift();
      currentStepToDraw = item.step;

      // Flash corresponding drum pads on beat
      item.tracks.forEach(track => {
        this.flashPad(track);
      });
    }

    if (currentStepToDraw !== this.lastDrawnStep && currentStepToDraw >= 0) {
      this.clearPlayheadHighlight();

      // Highlight step number
      if (this.stepHeaderCells[currentStepToDraw]) {
        this.stepHeaderCells[currentStepToDraw].classList.add('is-playhead');
      }

      // Highlight step buttons in this column
      this.tracks.forEach(track => {
        const btn = this.stepButtons[track][currentStepToDraw];
        if (btn) btn.classList.add('is-playhead');
      });

      this.lastDrawnStep = currentStepToDraw;
    }
  }

  clearPlayheadHighlight() {
    this.stepHeaderCells.forEach(cell => cell.classList.remove('is-playhead'));
    this.tracks.forEach(track => {
      this.stepButtons[track].forEach(btn => btn.classList.remove('is-playhead'));
    });
  }

  // ============================================================================
  // 5. Presets & Pattern Management
  // ============================================================================
  loadPreset(presetName) {
    const preset = this.presets[presetName];
    if (!preset) return;

    // Set BPM
    this.bpm = preset.bpm;
    this.dom.bpmSlider.value = this.bpm;
    this.updateBpmDisplay();

    // Populate pattern
    this.tracks.forEach(track => {
      const trackData = preset.pattern[track] || [];
      for (let i = 0; i < this.totalSteps; i++) {
        const active = Boolean(trackData[i]);
        this.pattern[track][i] = active;
        const btn = this.stepButtons[track][i];
        if (btn) {
          if (active) {
            btn.classList.add('is-active');
          } else {
            btn.classList.remove('is-active');
          }
        }
      }
    });

    // Update active preset button style
    this.dom.presetButtons.forEach(btn => {
      if (btn.dataset.preset === presetName) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  clearPattern() {
    this.tracks.forEach(track => {
      for (let i = 0; i < this.totalSteps; i++) {
        this.pattern[track][i] = false;
        const btn = this.stepButtons[track][i];
        if (btn) btn.classList.remove('is-active');
      }
    });
    this.clearPresetActiveStyle();
  }

  clearPresetActiveStyle() {
    this.dom.presetButtons.forEach(btn => btn.classList.remove('is-active'));
  }

  // ============================================================================
  // 6. Drum Pads Interaction & Flash Visuals
  // ============================================================================
  flashPad(soundId) {
    const pad = document.querySelector(`.drum-pad[data-sound="${soundId}"]`);
    if (!pad) return;

    pad.classList.remove('is-flashing');
    // Force DOM reflow to restart animation reliably
    void pad.offsetWidth;
    pad.classList.add('is-flashing');

    setTimeout(() => {
      pad.classList.remove('is-flashing');
    }, 120);
  }

  // ============================================================================
  // 7. Event Handlers & User Controls
  // ============================================================================
  bindEvents() {
    // Play/Stop button
    this.dom.playBtn.addEventListener('click', () => this.togglePlay());

    // Clear Pattern button
    this.dom.clearBtn.addEventListener('click', () => {
      this.soundEngine.ensureContext();
      this.clearPattern();
    });

    // Tempo (BPM) Slider & Steppers
    this.dom.bpmSlider.addEventListener('input', (e) => {
      this.bpm = parseInt(e.target.value, 10);
      this.updateBpmDisplay();
      this.clearPresetActiveStyle();
    });

    this.dom.bpmMinus.addEventListener('click', () => {
      if (this.bpm > 60) {
        this.bpm -= 1;
        this.dom.bpmSlider.value = this.bpm;
        this.updateBpmDisplay();
        this.clearPresetActiveStyle();
      }
    });

    this.dom.bpmPlus.addEventListener('click', () => {
      if (this.bpm < 180) {
        this.bpm += 1;
        this.dom.bpmSlider.value = this.bpm;
        this.updateBpmDisplay();
        this.clearPresetActiveStyle();
      }
    });

    // Volume Slider
    this.dom.volumeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.soundEngine.setVolume(val / 100);
      this.updateVolumeDisplay();
    });

    // Mute Button
    this.dom.muteBtn.addEventListener('click', () => {
      const isMuted = this.soundEngine.toggleMute();
      if (isMuted) {
        this.dom.iconVolume.style.display = 'none';
        this.dom.iconMuted.style.display = 'block';
        this.dom.volumeDisplay.textContent = 'Tắt';
      } else {
        this.dom.iconVolume.style.display = 'block';
        this.dom.iconMuted.style.display = 'none';
        this.updateVolumeDisplay();
      }
    });

    // Preset buttons
    this.dom.presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.soundEngine.ensureContext();
        const presetName = btn.dataset.preset;
        this.loadPreset(presetName);
      });
    });

    // Audition preview buttons on tracks
    this.dom.auditionButtons.forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.soundEngine.ensureContext();
        const soundId = btn.dataset.sound;
        this.soundEngine.play(soundId);
        this.flashPad(soundId);
        btn.classList.add('is-firing');
        setTimeout(() => btn.classList.remove('is-firing'), 120);
      });
    });

    // Drum Pads Tapping (Pointer events for zero delay on mobile and desktop)
    this.dom.drumPads.forEach(pad => {
      const soundId = pad.dataset.sound;

      pad.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.soundEngine.ensureContext();
        this.soundEngine.play(soundId);
        this.flashPad(soundId);
      });
    });
  }

  bindKeyboardShortcuts() {
    const keyMap = {
      '1': 'kick',
      '2': 'snare',
      '3': 'hihat',
      '4': 'clap',
      'q': 'tom',
      'w': 'rim',
      'e': 'crash',
      'r': 'cowbell',
      'a': 'openhat',
      's': 'shaker',
      'd': 'kick2',
      'f': 'snare2',
      'z': 'perc',
      'x': 'bass',
      'c': 'fx',
      'v': 'vocal'
    };

    window.addEventListener('keydown', (e) => {
      // Ignore if typing inside input fields
      if (e.target.tagName === 'INPUT') return;

      const key = e.key.toLowerCase();

      // Spacebar toggles Play/Stop
      if (e.code === 'Space' || key === ' ') {
        e.preventDefault();
        this.togglePlay();
        return;
      }

      // Check drum pad shortcuts
      if (keyMap[key]) {
        e.preventDefault();
        this.soundEngine.ensureContext();
        const soundId = keyMap[key];
        this.soundEngine.play(soundId);
        this.flashPad(soundId);
      }
    });
  }

  updateBpmDisplay() {
    this.dom.bpmDisplay.textContent = this.bpm;
  }

  updateVolumeDisplay() {
    const volPercent = Math.round(this.soundEngine.volume * 100);
    this.dom.volumeDisplay.textContent = `${volPercent}%`;
  }
}

// ============================================================================
// 8. Bootstrap Application on DOM Ready
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  const app = new BeatFarmApp();
  app.init();
  // Expose to window for testing / debugging if needed
  window.beatFarmApp = app;
});
