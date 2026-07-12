export const playLevelUpSound = () => {
  if (typeof window === "undefined" || !window.AudioContext) return;
  
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a sequence of 3 ascending notes for a "level up" feel
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTime);
      
      // Envelope
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + startTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start(audioCtx.currentTime + startTime);
      oscillator.stop(audioCtx.currentTime + startTime + duration);
    };

    playNote(440, 0, 0.2); // A4
    playNote(554.37, 0.15, 0.2); // C#5
    playNote(659.25, 0.3, 0.4); // E5

  } catch (err) {
    console.error("Audio playback failed", err);
  }
};
