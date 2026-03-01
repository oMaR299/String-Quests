
import { useCallback } from 'react';

export const useSounds = () => {
  const createOscillator = (
    ctx: AudioContext,
    type: OscillatorType,
    freq: number,
    startTime: number,
    duration: number
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0.05, startTime); // Low gain for "soft" sound
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
    
    return { osc, gain };
  };

  const getContext = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return null;
    return new AudioContext();
  };

  // 1. زر "متأكد"
  const playSure = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; 
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = now + (i * 0.06);
      const duration = 0.4;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }, []);

  // 2. زر "غير متأكد"
  const playUnsure = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    const duration = 0.25;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }, []);

  // 3. Hint
  const playHint = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.1);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }, []);

  // 4. Transition
  const playTransition = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }, []);

  // 5. Click
  const playClick = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    const duration = 0.1;
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }, []);

  // 6. Full Celebration (For End Screen)
  const playCelebration = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const chordNotes = [523.25, 659.25, 783.99, 1046.50];
    chordNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = now;
      const duration = 1.5;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.06, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    for(let i=0; i<8; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const pentatonic = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00]; 
        const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        osc.frequency.value = note;
        const delay = Math.random() * 0.4;
        const startTime = now + delay;
        const duration = 0.4;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.04, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }
  }, []);

  // 7. Short Success (Celebratory for any correct answer)
  const playSuccessShort = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Fast Arpeggio (C-E-G-C) - Happy and Bright
    const notes = [523.25, 659.25, 783.99, 1046.50]; 
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (i * 0.08));
        
        gain.gain.setValueAtTime(0, now + (i * 0.08));
        gain.gain.linearRampToValueAtTime(0.08, now + (i * 0.08) + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.08) + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + (i * 0.08));
        osc.stop(now + (i * 0.08) + 0.3);
    });
  }, []);

  // 8. Gentle Error (Soft, calm sound for any wrong answer)
  const playGentleError = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Soft descending sine wave, low pitch, non-aggressive
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.4);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }, []);

  // 9. Soft Ding (Kept for potential reuse)
  const playSoftDing = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6); 
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }, []);

  // 10. Pop (Kept for potential reuse)
  const playPop = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(500, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }, []);

  return { playSure, playUnsure, playHint, playTransition, playClick, playCelebration, playSuccessShort, playGentleError, playSoftDing, playPop };
};
