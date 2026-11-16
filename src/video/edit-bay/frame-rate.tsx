/** @jsxImportSource react */

import { createContext, useContext, useMemo, type ReactNode } from 'react';

/**
 * Browsers don't report a video's frame rate, so the skin takes it as a prop. Timecode frames and single-frame steps
 * both depend on it.
 *
 * NTSC rates such as 23.976, 29.97, and 59.94 are really 24, 30, and 60 × 1000/1001. Frames are counted at that exact
 * rate, so the count stays on the source's frames over a long program. Timecode labels them against 24, 30, or 60, as
 * non-drop-frame timecode does, or as drop-frame timecode for 29.97 and 59.94 when `dropFrame` is on.
 */
export interface FrameRate {
  /** Frames per second, exact for NTSC rates: 30000/1001 for 29.97. */
  rate: number;
  /** Frames per timecode second: 24, 30, or 60 for NTSC rates. */
  base: number;
  /** Drop-frame timecode, only for 29.97 and 59.94. */
  dropFrame: boolean;
}

const NTSC_BASES = [24, 30, 48, 60, 120];

/** Frame rate as given, or the exact NTSC rate it stands for: 23.976 and 23.98 become 24000/1001. */
export function exactRate(frameRate: number) {
  for (const base of NTSC_BASES) {
    const ntsc = (base * 1000) / 1001;
    if (Math.abs(frameRate - ntsc) < 0.01) return ntsc;
  }
  return frameRate;
}

export function resolveFrameRate(frameRate: number, dropFrame = false): FrameRate {
  const rate = exactRate(Number.isFinite(frameRate) && frameRate > 0 ? frameRate : 30);
  const base = Math.max(1, Math.round(rate));
  const ntsc = rate !== base;
  return { rate, base, dropFrame: dropFrame && ntsc && (base === 30 || base === 60) };
}

const FrameRateContext = createContext<FrameRate>(resolveFrameRate(30));

export function FrameRateProvider({
  frameRate,
  dropFrame = false,
  children,
}: {
  frameRate: number;
  dropFrame?: boolean;
  children: ReactNode;
}) {
  const value = useMemo(() => resolveFrameRate(frameRate, dropFrame), [frameRate, dropFrame]);
  return <FrameRateContext.Provider value={value}>{children}</FrameRateContext.Provider>;
}

export function useFrameRate() {
  return useContext(FrameRateContext);
}

/**
 * The frame a time falls in, counted from zero. The small allowance keeps a frame's own start time, which can come
 * back a few microseconds early after rounding in the container, from reading as the frame before.
 */
export function frameAt(seconds: number, { rate }: FrameRate) {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  return Math.floor(safe * rate + 1e-3);
}

/** The middle of a frame, in seconds. Seeking there never lands on a neighbor after rounding. */
export function frameMiddle(frame: number, { rate }: FrameRate) {
  return (frame + 0.5) / rate;
}

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * The timecode label for a frame count. Drop-frame timecode skips labels, not frames: 2 labels a minute at 29.97 and
 * 4 at 59.94, except every tenth minute, so the timecode keeps pace with the clock.
 */
function frameLabel(frame: number, { rate, base, dropFrame }: FrameRate) {
  let label = frame;
  if (dropFrame) {
    const dropped = base / 15;
    const perTenMinutes = Math.round(rate * 600);
    const perMinute = base * 60 - dropped;
    const tens = Math.floor(frame / perTenMinutes);
    const rest = frame % perTenMinutes;
    label += dropped * 9 * tens + (rest > dropped ? dropped * Math.floor((rest - dropped) / perMinute) : 0);
  }
  const frames = label % base;
  const totalSeconds = Math.floor(label / base);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  // Drop-frame timecode sets the frames apart with a semicolon, as editing software does.
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}${dropFrame ? ';' : ':'}${pad(frames)}`;
}

/** Formats seconds as HH:MM:SS:FF, or HH:MM:SS;FF for drop-frame timecode. */
export function formatTimecode(seconds: number, frameRate: FrameRate) {
  return frameLabel(frameAt(seconds, frameRate), frameRate);
}

/**
 * Where a whole timecode second starts, for ruler marks: its :00 frame, or ;02 or ;04 in a minute where drop-frame
 * timecode skips labels. At NTSC rates a timecode second runs a little longer than a second on the clock.
 */
export function timecodeSecond(second: number, frameRate: FrameRate) {
  const { base, dropFrame } = frameRate;
  let frame = second * base;
  if (dropFrame) {
    const dropped = base / 15;
    const minutes = Math.floor(second / 60);
    frame -= dropped * (minutes - Math.floor(minutes / 10));
    if (second % 60 === 0 && minutes % 10 !== 0) frame += dropped;
  }
  return { seconds: frame / frameRate.rate, label: frameLabel(frame, frameRate) };
}

/** Formats a frame rate as editors write it: "24 fps", "23.976 fps", "29.97 fps", plus "DF" for drop-frame. */
export function formatFrameRate({ rate, dropFrame }: FrameRate) {
  const rounded = Math.round(rate * 1000) / 1000;
  return `${rounded} fps${dropFrame ? ' DF' : ''}`;
}
