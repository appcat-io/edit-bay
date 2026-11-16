/** @jsxImportSource react */

import { selectPlayback, selectTime, useMedia, usePlayer } from '@videojs/react';
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';

import { frameAt, frameMiddle, useFrameRate } from './frame-rate';

/**
 * The timestamp of the frame on screen. `currentTime` is where playback is, which in some browsers follows the audio
 * clock and can be a frame or more off the picture. `requestVideoFrameCallback` reports each frame's own presentation
 * time as the browser shows it, so timecode can name the frame the viewer sees.
 *
 * Browser support: Chrome and Edge 83, Safari 15.4, Firefox 132. Elsewhere the skin falls back to `currentTime`.
 */
interface FrameStore {
  get: () => number | undefined;
  subscribe: (listener: () => void) => () => void;
  /** Where a frame step starts: the frame on screen, or the target of a seek still on its way. */
  stepFrom: (frameDuration: number) => number | undefined;
}

const NO_STORE: FrameStore = { get: () => undefined, subscribe: () => () => {}, stepFrom: () => undefined };
const PresentedFrameContext = createContext<FrameStore>(NO_STORE);

type FrameVideo = HTMLVideoElement & {
  requestVideoFrameCallback: (callback: (now: number, metadata: { mediaTime: number }) => void) => number;
  cancelVideoFrameCallback: (handle: number) => void;
};

/**
 * The video element behind the player's media, if the browser can report its frames. Streaming media such as Mux and
 * HLS come as an adapter that holds the element as `target`.
 */
function frameVideo(media: unknown): FrameVideo | null {
  if (!media || typeof media !== 'object') return null;
  const target = (media as { target?: unknown }).target;
  const element = media instanceof HTMLVideoElement ? media : target instanceof HTMLVideoElement ? target : null;
  return element && 'requestVideoFrameCallback' in element ? (element as FrameVideo) : null;
}

export function PresentedFrameProvider({ children }: { children: ReactNode }) {
  const media = useMedia();
  const frameRate = useFrameRate();
  const [store, setStore] = useState<FrameStore>(NO_STORE);

  useEffect(() => {
    const video = frameVideo(media);
    if (!video) {
      setStore(NO_STORE);
      return;
    }

    let presented: number | undefined;
    // The player's time when that frame was drawn. If the time has moved since, a seek is on its way: the frame on
    // screen is still the old one, but a step must count from the new position. The seeking event comes too late for
    // two quick presses, and `currentTime` changes at once.
    let timeAtFrame: number | undefined;
    const listeners = new Set<() => void>();
    const notify = () => listeners.forEach((listener) => listener());

    let handle = 0;
    const onFrame = (_now: number, metadata: { mediaTime: number }) => {
      if (!video.seeking) timeAtFrame = video.currentTime;
      if (metadata.mediaTime !== presented) {
        presented = metadata.mediaTime;
        notify();
      }
      handle = video.requestVideoFrameCallback(onFrame);
    };
    handle = video.requestVideoFrameCallback(onFrame);

    // A new source starts over; the last frame of the old one no longer applies.
    const reset = () => {
      presented = undefined;
      notify();
    };
    // Pausing settles on a whole frame, as in an editor: the middle of the frame on screen, so the picture, the
    // timecode, and the next step agree. Some browsers draw one more frame after pausing without reporting it; this
    // brings the picture back to the frame the timecode names. It waits a moment for the last frame report, and
    // leaves the time alone if anything else moves it first, such as a step or a drag on the timeline.
    let settle = 0;
    const onPause = () => {
      if (!video.seeking) timeAtFrame = video.currentTime;
      window.clearTimeout(settle);
      const pausedAt = video.currentTime;
      settle = window.setTimeout(() => {
        if (!video.paused || video.ended || video.seeking || video.currentTime !== pausedAt) return;
        const shown =
          presented !== undefined && plausible(presented, pausedAt, 1 / frameRate.rate) ? presented : pausedAt;
        const middle = frameMiddle(frameAt(shown, frameRate), frameRate);
        if (Math.abs(middle - pausedAt) > 1e-4 && middle < video.duration) video.currentTime = middle;
      }, 150);
    };
    video.addEventListener('emptied', reset);
    video.addEventListener('pause', onPause);

    setStore({
      get: () => presented,
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      // Two quick presses step two frames: the second starts from the first one's target, not the frame still shown.
      stepFrom: (frameDuration) =>
        presented === undefined ||
        video.seeking ||
        video.currentTime !== timeAtFrame ||
        !plausible(presented, video.currentTime, frameDuration)
          ? video.currentTime
          : presented,
    });

    return () => {
      video.cancelVideoFrameCallback(handle);
      window.clearTimeout(settle);
      video.removeEventListener('emptied', reset);
      video.removeEventListener('pause', onPause);
    };
  }, [media, frameRate]);

  return <PresentedFrameContext.Provider value={store}>{children}</PresentedFrameContext.Provider>;
}

/**
 * Some engines report frame times off the picture, such as two frames ahead in WebKit on Linux. While paused, a frame
 * time more than a frame from the player's own time is not trusted.
 */
function plausible(presented: number, current: number, frameDuration: number) {
  return Math.abs(presented - current) < frameDuration;
}

/**
 * The time to show as the current timecode: the frame on screen when the browser reports it, otherwise `currentTime`.
 * While playing, the player's time can trail the picture, and the frame report is used unless it is far off, as during
 * a jump. While paused, it is used only within a frame of the player's time.
 */
export function usePresentedTime(frameDuration: number) {
  const store = useContext(PresentedFrameContext);
  const presented = useSyncExternalStore(store.subscribe, store.get, store.get);
  const current = usePlayer(selectTime)?.currentTime ?? 0;
  const playing = usePlayer(selectPlayback)?.paused === false;
  if (presented === undefined) return current;
  const near = playing ? Math.abs(presented - current) < 0.5 : plausible(presented, current, frameDuration);
  return near ? presented : current;
}

/** Returns a function that reads where a frame step should start, or undefined to use the player's time. */
export function useStepFrom() {
  return useContext(PresentedFrameContext).stepFrom;
}
