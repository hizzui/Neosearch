/**
 * Audio Effects - Generate and play brutalist sound effects
 * Uses Web Audio API for efficient sound synthesis
 */

let audioContext: AudioContext | null = null;

// Lazy initialize audio context (needed for browser autoplay policies)
const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Play a click sound (short, high-pitched beep)
 */
export const playClickSound = (volume: number = 0.3) => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // High pitch, short duration
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    
    // Sharp attack, quick decay
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (error) {
    // Silently fail if audio context unavailable
    console.debug('Audio context not available:', error);
  }
};

/**
 * Play a transition sound (whoosh effect)
 */
export const playTransitionSound = (volume: number = 0.2) => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create two oscillators for richer sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    // Sweeping frequency (whoosh)
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    
    osc2.frequency.setValueAtTime(250, now);
    osc2.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    // Smooth envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  } catch (error) {
    console.debug('Audio context not available:', error);
  }
};

/**
 * Play a notification sound (ding)
 */
export const playNotificationSound = (volume: number = 0.25) => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Two-tone notification
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(800, now + 0.15);
    
    gain.gain.setValueAtTime(volume, now);
    gain.gain.setValueAtTime(volume, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (error) {
    console.debug('Audio context not available:', error);
  }
};

/**
 * Play a glitch sound (random noise burst)
 */
export const playGlitchSound = (volume: number = 0.15, duration: number = 0.1) => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create white noise using buffer
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noiseSource.buffer = noiseBuffer;
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    // Harsh filter settings for glitch
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, now);
    
    // Sharp attack and decay
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    noiseSource.start(now);
    noiseSource.stop(now + duration);
  } catch (error) {
    console.debug('Audio context not available:', error);
  }
};

/**
 * Enable audio playback (needed for autoplay policies)
 * Call this on first user interaction
 */
export const enableAudio = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (error) {
    console.debug('Could not enable audio:', error);
  }
};
