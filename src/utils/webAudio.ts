"use client";

// Shared Web Audio context instance (lazy initialized on first user interaction)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (err) {
    console.warn("Web Audio API not supported or blocked:", err);
    return null;
  }
}

/**
 * 1. TAPPING THE MATKA (Mock Test 6, Experiment 1)
 * Simulates the acoustic pitch of tapping a ceramic/clay water pot.
 * Frequency strictly maps to the vibrating air column:
 * As water level increases, the empty air volume decreases -> shorter column vibrates faster -> higher frequency.
 * Base frequency: 200 Hz + (waterLevel * 5) Hz (250 Hz at 10% fill up to 650 Hz at 90% fill).
 */
export function playMatkaTap(frequency: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Primary fundamental oscillator (resonant hollow body)
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(frequency, now);

  // Secondary inharmonic overtone (typical of ceramic/clay pot tap: ~1.7x fundamental)
  const osc2 = ctx.createOscillator();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(frequency * 1.72, now);

  // Gain envelopes
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.4, now + 0.008); // Sharp ceramic click attack
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.45); // Natural hollow pot decay

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.linearRampToValueAtTime(0.12, now + 0.004);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.18); // Fast decay for metallic/clay transient

  osc1.connect(gain1);
  osc2.connect(gain2);

  gain1.connect(ctx.destination);
  gain2.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);

  osc1.stop(now + 0.46);
  osc2.stop(now + 0.20);
}

/**
 * 2. STRING TELEPHONE (Mock Test 6, Experiment 2)
 * Simulates acoustic transmission across a physical string.
 * - Loose string (<40% tension): cannot sustain longitudinal wave propagation -> muffled damp thud.
 * - Pinched string: mechanical dampening stops sound wave at finger -> brief aborted click, silence at receiver.
 * - Taut string (>=40% tension, unpinched): clear voice chirp transmission through tin can.
 */
export function playStringTelephone(tension: number, pinched: boolean) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (pinched) {
    // Pinched: Mechanical wave is abruptly absorbed at the finger
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06); // Abrupt 60ms damp

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
    return;
  }

  if (tension < 40) {
    // Slack string: Sound energy is lost in loose string sags
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.20);
    return;
  }

  // Taut string: Transmits crisp simulated speech formant chirp ("Hel-lo!")
  // Syllable 1: "Hel-" (~350 Hz to 420 Hz)
  const oscHel = ctx.createOscillator();
  const gainHel = ctx.createGain();
  oscHel.type = "sine";
  oscHel.frequency.setValueAtTime(340, now);
  oscHel.frequency.linearRampToValueAtTime(420, now + 0.14);

  gainHel.gain.setValueAtTime(0.001, now);
  gainHel.gain.linearRampToValueAtTime(0.25, now + 0.02);
  gainHel.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  oscHel.connect(gainHel);
  gainHel.connect(ctx.destination);
  oscHel.start(now);
  oscHel.stop(now + 0.16);

  // Syllable 2: "-lo!" (~460 Hz to 380 Hz)
  const oscLo = ctx.createOscillator();
  const gainLo = ctx.createGain();
  oscLo.type = "triangle";
  oscLo.frequency.setValueAtTime(460, now + 0.18);
  oscLo.frequency.linearRampToValueAtTime(370, now + 0.42);

  gainLo.gain.setValueAtTime(0.001, now + 0.18);
  gainLo.gain.linearRampToValueAtTime(0.28, now + 0.20);
  gainLo.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

  oscLo.connect(gainLo);
  gainLo.connect(ctx.destination);
  oscLo.start(now + 0.18);
  oscLo.stop(now + 0.50);
}

/**
 * 3. WELL ECHOES (Mock Test 6, Experiment 3)
 * Plays vocal shout followed by delayed, attenuated echo reflection.
 */
export function playShoutWithEcho(hasEcho: boolean, delaySeconds: number = 0.4) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Initial shout
  const shoutOsc = ctx.createOscillator();
  const shoutGain = ctx.createGain();
  shoutOsc.type = "sawtooth";
  shoutOsc.frequency.setValueAtTime(320, now);
  shoutOsc.frequency.linearRampToValueAtTime(240, now + 0.22);

  // Lowpass filter to shape vocal timbre
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(800, now);

  shoutGain.gain.setValueAtTime(0.001, now);
  shoutGain.gain.linearRampToValueAtTime(0.3, now + 0.02);
  shoutGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  shoutOsc.connect(filter);
  filter.connect(shoutGain);
  shoutGain.connect(ctx.destination);

  shoutOsc.start(now);
  shoutOsc.stop(now + 0.26);

  if (hasEcho) {
    // Delayed reflected sound wave
    const echoTime = now + delaySeconds;
    const echoOsc = ctx.createOscillator();
    const echoGain = ctx.createGain();
    const echoFilter = ctx.createBiquadFilter();

    echoOsc.type = "sawtooth";
    echoOsc.frequency.setValueAtTime(300, echoTime);
    echoOsc.frequency.linearRampToValueAtTime(230, echoTime + 0.22);

    // Well acoustic absorption filters high frequencies
    echoFilter.type = "lowpass";
    echoFilter.frequency.setValueAtTime(500, echoTime);

    echoGain.gain.setValueAtTime(0.001, echoTime);
    echoGain.gain.linearRampToValueAtTime(0.14, echoTime + 0.02);
    echoGain.gain.exponentialRampToValueAtTime(0.0001, echoTime + 0.32);

    echoOsc.connect(echoFilter);
    echoFilter.connect(echoGain);
    echoGain.connect(ctx.destination);

    echoOsc.start(echoTime);
    echoOsc.stop(echoTime + 0.34);
  }
}

/**
 * 4. HEARTBEAT PULSE SYNTHESIS (Mock Test 10, Experiment 1)
 * Simulates a realistic acoustic stethoscope "lub-dub" sound.
 * "Lub" (S1): lower frequency (~65 Hz), slightly longer decay (~0.12s)
 * "Dub" (S2): slightly higher frequency (~95 Hz), sharper snap (~0.09s)
 */
export function playHeartbeat(bpm: number = 72) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // --- S1: "Lub" ---
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const filter1 = ctx.createBiquadFilter();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(65, now);
  osc1.frequency.exponentialRampToValueAtTime(45, now + 0.12);

  filter1.type = "lowpass";
  filter1.frequency.setValueAtTime(150, now);

  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.35, now + 0.015);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  osc1.connect(filter1);
  filter1.connect(gain1);
  gain1.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.15);

  // --- S2: "Dub" (approx 140ms after S1) ---
  const s2Time = now + 0.14;
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  const filter2 = ctx.createBiquadFilter();

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(95, s2Time);
  osc2.frequency.exponentialRampToValueAtTime(60, s2Time + 0.09);

  filter2.type = "lowpass";
  filter2.frequency.setValueAtTime(180, s2Time);

  gain2.gain.setValueAtTime(0.001, s2Time);
  gain2.gain.linearRampToValueAtTime(0.28, s2Time + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, s2Time + 0.11);

  osc2.connect(filter2);
  filter2.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(s2Time);
  osc2.stop(s2Time + 0.12);
}
