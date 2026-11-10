/** @jsxImportSource react */

import { createContext, useContext, type ReactNode } from 'react';

/**
 * Browsers don't report a video's frame rate, so the skin takes it as a prop. Timecode frames and single-frame steps
 * both depend on it. 29.97 and 59.94 sources count frames against 30 and 60, as non-drop-frame timecode does.
 */
const FrameRateContext = createContext(30);

export function FrameRateProvider({ frameRate, children }: { frameRate: number; children: ReactNode }) {
  const value = Number.isFinite(frameRate) && frameRate > 0 ? frameRate : 30;
  return <FrameRateContext.Provider value={value}>{children}</FrameRateContext.Provider>;
}

export function useFrameRate() {
  return useContext(FrameRateContext);
}

/** The integer frame count per second used for timecode, such as 30 for 29.97. */
export function timebase(frameRate: number) {
  return Math.max(1, Math.round(frameRate));
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Formats seconds as HH:MM:SS:FF. */
export function formatTimecode(seconds: number, frameRate: number) {
  const base = timebase(frameRate);
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  // A small epsilon keeps 1.9999999 from reading as frame 29 of the previous second.
  const totalFrames = Math.floor(safe * base + 1e-4);
  const frames = totalFrames % base;
  const totalSeconds = Math.floor(totalFrames / base);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}:${pad(frames)}`;
}

/** Formats a frame rate for display, such as "24 fps" or "29.97 fps". */
export function formatFrameRate(frameRate: number) {
  const rounded = Math.round(frameRate * 100) / 100;
  return `${rounded} fps`;
}
