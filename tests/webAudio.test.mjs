import test from 'node:test';
import assert from 'node:assert/strict';

import { playHeartbeat } from '../src/utils/webAudio.ts';

test('Web Audio API: playHeartbeat', async (t) => {
  await t.test('executes safely in server-side/headless environments without throwing', () => {
    // In Node.js, window is typically undefined
    assert.doesNotThrow(() => {
      playHeartbeat(72);
      playHeartbeat(120);
    }, 'playHeartbeat must be resilient to non-browser execution environments');
  });

  await t.test('constructs dual-tone S1 (lub) and S2 (dub) oscillators when AudioContext is available', () => {
    let oscillatorCount = 0;
    let biquadFilterCount = 0;
    let gainNodeCount = 0;
    const startedOscillators = [];
    const stoppedOscillators = [];

    class MockAudioParam {
      constructor(val = 0) {
        this.value = val;
      }
      setValueAtTime(val) { this.value = val; }
      linearRampToValueAtTime(val) { this.value = val; }
      exponentialRampToValueAtTime(val) { this.value = val; }
    }

    class MockAudioNode {
      connect(target) { return target; }
    }

    class MockOscillator extends MockAudioNode {
      constructor() {
        super();
        oscillatorCount++;
        this.type = 'sine';
        this.frequency = new MockAudioParam(440);
      }
      start(time) { startedOscillators.push(time); }
      stop(time) { stoppedOscillators.push(time); }
    }

    class MockBiquadFilter extends MockAudioNode {
      constructor() {
        super();
        biquadFilterCount++;
        this.type = 'lowpass';
        this.frequency = new MockAudioParam(350);
      }
    }

    class MockGain extends MockAudioNode {
      constructor() {
        super();
        gainNodeCount++;
        this.gain = new MockAudioParam(1);
      }
    }

    class MockAudioContext {
      constructor() {
        this.currentTime = 0.5;
        this.state = 'running';
        this.destination = new MockAudioNode();
      }
      createOscillator() { return new MockOscillator(); }
      createGain() { return new MockGain(); }
      createBiquadFilter() { return new MockBiquadFilter(); }
      resume() { return Promise.resolve(); }
    }

    // Attach mock window & AudioContext
    const prevWindow = globalThis.window;
    globalThis.window = {
      AudioContext: MockAudioContext,
    };

    try {
      playHeartbeat(80);

      assert.equal(oscillatorCount, 2, 'Must create exactly two oscillators for S1 and S2 acoustic components');
      assert.equal(biquadFilterCount, 2, 'Must apply low-pass filtering to both pulses');
      assert.equal(gainNodeCount, 2, 'Must apply gain envelopes to both pulses');
      assert.equal(startedOscillators.length, 2, 'Both oscillators must be started');
      assert.equal(stoppedOscillators.length, 2, 'Both oscillators must be scheduled to stop');
      
      // S2 should start after S1
      assert.ok(startedOscillators[1] > startedOscillators[0], 'Dub (S2) must be scheduled after Lub (S1)');
    } finally {
      globalThis.window = prevWindow;
    }
  });
});
