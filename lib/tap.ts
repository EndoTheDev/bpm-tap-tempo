// Tap-tempo math, pure functions - no react, no DOM, testable.
// flat average over the last 8 intervals, median-trimmed (drops the worst
// outlier), 3s gap = auto-reset. settled Q20: flat, not weighted.

export const WINDOW = 8;
export const RESET_MS = 3000;

export interface TapState {
  bpm: number | null;
  taps: number;
  jitter: number; // 0..1, 1 = perfectly consistent
}

export function intervalsFromTimes(times: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < times.length; i++) {
    const d = times[i]! - times[i - 1]!;
    if (d > 0) out.push(d);
  }
  return out;
}

// median-trim: drop the single worst outlier (biggest deviation from the median)
export function trimOutlier(intervals: number[]): number[] {
  if (intervals.length < 3) return intervals;
  const sorted = [...intervals].sort((a, b) => a - b);
  const mid = sorted[Math.floor(sorted.length / 2)]!;
  let worst = 0;
  let worstDist = -1;
  intervals.forEach((v, i) => {
    const dist = Math.abs(v - mid);
    if (dist > worstDist) {
      worstDist = dist;
      worst = i;
    }
  });
  // only actually drop it if it's far off (>50% from median) - the "hesitated" tap
  if (worstDist > mid * 0.5) {
    return intervals.filter((_, i) => i !== worst);
  }
  return intervals;
}

export function analyze(intervals: number[]): TapState {
  if (intervals.length === 0) return { bpm: null, taps: 0, jitter: 0 };
  const kept = trimOutlier(intervals);
  const avg = kept.reduce((a, b) => a + b, 0) / kept.length;
  const mean = avg;
  let variance = 0;
  for (const v of kept) variance += (v - mean) ** 2;
  variance /= kept.length;
  const std = Math.sqrt(variance);
  // jitter: 1 = zero spread, 0 = wild taps. clamp.
  const jitter = Math.max(0, Math.min(1, 1 - std / Math.max(mean, 1)));
  return {
    bpm: Math.round((60000 / avg) * 10) / 10,
    taps: intervals.length,
    jitter,
  };
}

// the ratio set. half/double/dotted-eighth are always-on, the rest pill-toggle.
export interface Ratio {
  id: string;
  label: string;
  hint: string;
  num: number;
  den: number;
  advanced: boolean;
}

export const RATIOS: Ratio[] = [
  { id: "half", label: "half", hint: "the cross-genre bridge: 174 dnb reads as 87 hip-hop", num: 1, den: 2, advanced: false },
  { id: "double", label: "double", hint: "the classic pairing: 70 trap into 140 dubstep", num: 2, den: 1, advanced: false },
  { id: "dotted-eighth", label: "dotted eighth ×3/4", hint: "the house->dnb pivot: 129 -> 97 feels related", num: 3, den: 4, advanced: false },
  { id: "dotted-quarter", label: "dotted quarter ×3/2", hint: "the reverse pivot: 90 -> 135", num: 3, den: 2, advanced: true },
  { id: "two-thirds", label: "2/3", hint: "down a pivot: 128 -> 85.3", num: 2, den: 3, advanced: true },
  { id: "four-thirds", label: "4/3", hint: "129 -> 172, the pro house->dnb move (CCL, Zabiela)", num: 4, den: 3, advanced: true },
];

export function ratioBpm(bpm: number, r: Ratio): number {
  return Math.round(bpm * (r.num / r.den) * 10) / 10;
}

export const PITCH_RIDES = [-6, -4, 4, 6];

// one runnable check: fails if the math breaks
// run manually: BPM_SELF_CHECK=1 node --experimental-strip-types lib/tap.ts
if (process.env.BPM_SELF_CHECK === "1") {
  const t = (ms: number, n: number) => Array.from({ length: n }, () => ms);
  // 120 bpm = 500ms intervals
  const a = analyze(t(500, 8));
  const ok1 = a.bpm === 120 && a.jitter === 1;
  // outlier trimmed: 7x500ms + 1x2000ms -> the 2000 is the hesitated tap
  const b = analyze([...t(500, 7), 2000]);
  const ok2 = b.bpm === 120;
  // ratios: 128 bpm
  const r = (id: string) => RATIOS.find(x => x.id === id)!;
  const ok3
    = ratioBpm(128, r("half")) === 64
      && ratioBpm(128, r("double")) === 256
      && ratioBpm(128, r("dotted-eighth")) === 96
      && ratioBpm(128, r("four-thirds")) === 170.7;
  console.log("tap:", a.bpm, "trim:", b.bpm, "ratios:", ok3);
  console.log(ok1 && ok2 && ok3 ? "TAP CHECK PASS" : "TAP CHECK FAIL");
  process.exit(ok1 && ok2 && ok3 ? 0 : 1);
}