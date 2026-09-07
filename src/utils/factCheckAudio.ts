/**
 * Ambient Investigative Sound Engine for Fact-Checking (موسيقى تدقيق واستقصاء المعلومات)
 * Built entirely with Web Audio API for zero-latency, zero-dependency, guaranteed cross-platform playback.
 */

class FactCheckAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private timerId: number | null = null;
  private activeOscillators: OscillatorNode[] = [];

  private initContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  public async start(): Promise<boolean> {
    try {
      this.initContext();
      if (!this.ctx) return false;

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      if (this.isPlaying) return true;

      const now = this.ctx.currentTime;

      // Master Gain with smooth fade in and raised volume
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.linearRampToValueAtTime(0.88, now + 0.8);
      this.masterGain.connect(this.ctx.destination);

      // 1. Deep Contemplative Ambient Drone (D & A minor roots)
      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(720, now);
      droneFilter.connect(this.masterGain);

      const droneFrequencies = [73.42, 110.0, 146.83, 220.0]; // D2, A2, D3, A3
      this.activeOscillators = [];

      droneFrequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Subtle slow pitch drift for organic atmosphere
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.12 + idx * 0.04, now);
        lfoGain.gain.setValueAtTime(1.2, now);
        lfo.connect(osc.frequency);
        lfo.start(now);
        this.activeOscillators.push(lfo);

        oscGain.gain.setValueAtTime(0.42 / (idx + 1), now);
        osc.connect(oscGain);
        oscGain.connect(droneFilter);

        osc.start(now);
        this.activeOscillators.push(osc);
      });

      // 2. Delicate Investigative Scanning Pulses (Clockwork / Radar Chimes)
      const scale = [293.66, 349.23, 440.0, 523.25, 587.33]; // D4, F4, A4, C5, D5
      let step = 0;

      const triggerPulse = () => {
        if (!this.ctx || !this.masterGain || !this.isPlaying) return;

        const pulseTime = this.ctx.currentTime;
        const pulseOsc = this.ctx.createOscillator();
        const pulseGain = this.ctx.createGain();

        // Alternating warm sine bell
        const freq = scale[step % scale.length];
        step++;

        pulseOsc.type = 'sine';
        pulseOsc.frequency.setValueAtTime(freq, pulseTime);

        pulseGain.gain.setValueAtTime(0.0001, pulseTime);
        pulseGain.gain.exponentialRampToValueAtTime(0.22, pulseTime + 0.04);
        pulseGain.gain.exponentialRampToValueAtTime(0.0001, pulseTime + 1.2);

        pulseOsc.connect(pulseGain);
        pulseGain.connect(this.masterGain);

        pulseOsc.start(pulseTime);
        pulseOsc.stop(pulseTime + 1.25);

        pulseOsc.onended = () => {
          pulseOsc.disconnect();
          pulseGain.disconnect();
        };
      };

      // Play initial chime
      triggerPulse();

      // Recurring gentle investigative rhythm (every 1.6s)
      this.timerId = window.setInterval(triggerPulse, 1600);
      this.isPlaying = true;
      return true;
    } catch {
      this.isPlaying = false;
      return false;
    }
  }

  public stop() {
    if (!this.isPlaying) return;

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      } catch {
        // ignore ramp error if closed
      }

      setTimeout(() => {
        this.activeOscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // ignore
          }
        });
        this.activeOscillators = [];
        this.isPlaying = false;
      }, 550);
    } else {
      this.isPlaying = false;
    }
  }

  public getStatus() {
    return this.isPlaying;
  }
}

export const factCheckAudio = new FactCheckAudioEngine();
