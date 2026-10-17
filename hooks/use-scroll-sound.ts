import { useEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";

export type ScrollSoundPreset = "click" | "air" | "tick";

// Receives the signed scroll distance travelled since the last frame (0 when idle)
type FrameHandler = (signedDelta: number) => void;
type PresetBuilder = (ctx: AudioContext, out: AudioNode) => FrameHandler;

const MASTER_VOLUME = 0.9; // one knob for overall loudness across all presets

const fillNoise = (
  ctx: AudioContext,
  seconds: number,
  brown: boolean,
): AudioBuffer => {
  const buffer = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * seconds),
    ctx.sampleRate,
  );
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      // Leaky integrator: rolls off highs at ~6dB/oct, so it sounds like soft air instead of hiss
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5; // compensates for the level lost to integration
    } else {
      data[i] = white;
    }
  }
  return buffer;
};

// Mechanical detent: a crisp filtered-noise snap plus a short pitch-dropping thump for body
// Premium tactile scroll: a muted wooden snap with a subtle low-end body.
const createClick: PresetBuilder = (ctx, out) => {
  const STEP_PX = 85;
  const MIN_INTERVAL_S = 0.045;
  const FULL_SPEED_PX = 30;

  const burst = fillNoise(ctx, 0.035, false);

  let travelled = 0;
  let lastAt = 0;

  const play = (intensity: number): void => {
    const now = ctx.currentTime;

    // Keep the sound restrained and smooth.
    const level = 0.035 + 0.045 * intensity;

    // Short, warm, wooden-sounding transient.
    const snap = ctx.createBufferSource();
    snap.buffer = burst;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1300 + Math.random() * 350;
    filter.Q.value = 1.8;

    const snapEnv = ctx.createGain();
    snapEnv.gain.setValueAtTime(level, now);
    snapEnv.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.022,
    );

    snap.connect(filter);
    filter.connect(snapEnv);
    snapEnv.connect(out);

    snap.start(now);
    snap.stop(now + 0.03);

    // Soft tonal body gives the transient a tactile, physical feel.
    const body = ctx.createOscillator();
    body.type = "sine";

    body.frequency.setValueAtTime(145, now);
    body.frequency.exponentialRampToValueAtTime(
      82,
      now + 0.045,
    );

    const bodyEnv = ctx.createGain();
    bodyEnv.gain.setValueAtTime(level * 0.45, now);
    bodyEnv.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.05,
    );

    body.connect(bodyEnv);
    bodyEnv.connect(out);

    body.start(now);
    body.stop(now + 0.055);
  };

  return (signedDelta) => {
    if (signedDelta === 0) return;

    travelled += Math.abs(signedDelta);

    if (travelled < STEP_PX) return;

    travelled %= STEP_PX;

    const now = ctx.currentTime;

    if (now - lastAt < MIN_INTERVAL_S) return;

    lastAt = now;

    play(Math.min(Math.abs(signedDelta) / FULL_SPEED_PX, 1));
  };
};

// Soft wind: looping brown noise whose volume and brightness follow scroll speed
const createAir: PresetBuilder = (ctx, out) => {
  const FULL_SPEED_PX = 25;
  const MAX_GAIN = 0.25;
  const SMOOTHING_S = 0.12; // longer than a frame so speed jitter never causes audible wobble

  const source = ctx.createBufferSource();
  source.buffer = fillNoise(ctx, 4, true);
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.7;
  filter.frequency.value = 250;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  source.connect(filter).connect(gain).connect(out);
  source.start();

  return (signedDelta) => {
    const intensity = Math.min(Math.abs(signedDelta) / FULL_SPEED_PX, 1);
    const now = ctx.currentTime;
    gain.gain.setTargetAtTime(intensity * MAX_GAIN, now, SMOOTHING_S);
    filter.frequency.setTargetAtTime(250 + intensity * 1100, now, SMOOTHING_S);
  };
};

// Pentatonic sine ticks: pitch climbs scrolling down, descends scrolling up
const createTick: PresetBuilder = (ctx, out) => {
  const STEP_PX = 90;
  const MIN_INTERVAL_S = 0.05;
  const FULL_SPEED_PX = 25;
  const MAX_GAIN = 0.08;
  // C major pentatonic: neighbouring notes are always consonant, so scrolling never clashes
  const NOTES_HZ = [523.25, 587.33, 659.25, 783.99, 880.0];

  // Low-pass rounds the sine's edges so ticks sound like soft wood, not beeps
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2400;
  tone.connect(out);

  let travelled = 0;
  let lastAt = 0;
  let noteIndex = 0;

  const play = (frequency: number, intensity: number): void => {
    const now = ctx.currentTime;
    const peak = MAX_GAIN * (0.3 + 0.7 * intensity);

    // 3ms attack avoids an onset click; the exponential tail gives the plucked decay
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.linearRampToValueAtTime(peak, now + 0.003);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    envelope.connect(tone);

    // A quiet octave partial adds body so the tick isn't a thin pure sine
    const partials: ReadonlyArray<readonly [number, number]> = [
      [frequency, 1],
      [frequency * 2, 0.25],
    ];
    partials.forEach(([hz, level]) => {
      const osc = ctx.createOscillator();
      const partialGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = hz;
      partialGain.gain.value = level;
      osc.connect(partialGain).connect(envelope);
      osc.start(now);
      osc.stop(now + 0.16);
    });
  };

  return (signedDelta) => {
    if (signedDelta === 0) return;
    travelled += Math.abs(signedDelta);
    if (travelled < STEP_PX) return;
    travelled %= STEP_PX;

    const now = ctx.currentTime;
    if (now - lastAt < MIN_INTERVAL_S) return;
    lastAt = now;

    const length = NOTES_HZ.length;
    noteIndex = (noteIndex + (signedDelta > 0 ? 1 : -1) + length) % length;
    play(
      NOTES_HZ[noteIndex],
      Math.min(Math.abs(signedDelta) / FULL_SPEED_PX, 1),
    );
  };
};

const PRESETS: Record<ScrollSoundPreset, PresetBuilder> = {
  click: createClick,
  air: createAir,
  tick: createTick,
};

// Synthesised scroll feedback driven by an unbounded, wrap-safe scroll distance. Synthesis means no
// audio asset to ship, and reading distance (not scroll events) keeps it in sync with the eased motion.
export const useScrollSound = (
  enabled: boolean,
  distanceRef: RefObject<number>,
  preset: ScrollSoundPreset = "click",
): void => {
  useEffect(() => {
    if (!enabled) return;

    // Created inside an effect triggered by the toggle click, so the browser's autoplay policy allows it
    const ctx = new AudioContext();
    void ctx.resume();

    const master = ctx.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(ctx.destination);

    const handleFrame = PRESETS[preset](ctx, master);

    let lastDistance = distanceRef.current;
    const update = (): void => {
      const distance = distanceRef.current;
      handleFrame(distance - lastDistance);
      lastDistance = distance;
    };
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      // Closing the context stops every node still playing, including the looping air source
      void ctx.close();
    };
  }, [enabled, distanceRef, preset]);
};
