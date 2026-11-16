/** @jsxImportSource react */

import {
  Tooltip,
  selectPlayback,
  selectPlaybackRate,
  selectTextTrack,
  selectTime,
  useHotkey,
  usePlayer,
} from '@videojs/react';
import type { ReactElement } from 'react';

import { Button } from '../shared/button';
import { frameAt, frameMiddle, useFrameRate } from './frame-rate';
import { FrameBackIcon, FrameForwardIcon } from './icons';
import { useStepFrom } from './presented-frame';

/** Seconds a J press jumps back while playing at normal speed or paused. Matches the arrow keys and seek buttons. */
export const SEEK_STEP = 10;

/** Shuttle speeds for L and J, as in editing software. The speed menu keeps the player's own list. */
const SHUTTLE_RATES = [1, 2, 4];

/** A tooltip with our own label and key, for controls that have no built-in hotkey metadata. */
export function KeyTooltip({ label, shortcut, children }: { label: string; shortcut: string; children: ReactElement }) {
  return (
    <Tooltip.Root side="top">
      <Tooltip.Trigger render={children} />
      <Tooltip.Popup className={'media-popup media-popup-safe-area media-tooltip-popup'}>
        {label}
        <kbd className={'media-tooltip-shortcut'}>{shortcut}</kbd>
      </Tooltip.Popup>
    </Tooltip.Root>
  );
}

/** Steps one frame, pausing first so the frame holds. */
function useFrameStep() {
  const time = usePlayer(selectTime);
  const playback = usePlayer(selectPlayback);
  const frameRate = useFrameRate();
  const stepFrom = useStepFrom();

  return (direction: 1 | -1) => {
    if (!time) return;
    if (playback && !playback.paused) playback.pause();
    // Count from the frame on screen, which can differ from the player's time right after a pause.
    const index = frameAt(stepFrom(1 / frameRate.rate) ?? time.currentTime, frameRate) + direction;
    // Land in the middle of the target frame, so rounding never leaves the picture on the old one.
    const last = frameAt(time.duration, frameRate) - 1;
    const target = frameMiddle(Math.min(Math.max(0, index), Math.max(0, last)), frameRate);
    void time.seek(target);
  };
}

export function FrameStepButton({ direction }: { direction: 1 | -1 }) {
  const step = useFrameStep();
  const label = direction < 0 ? 'Previous frame' : 'Next frame';
  const key = direction < 0 ? ',' : '.';

  return (
    <KeyTooltip label={label} shortcut={key}>
      <Button
        type="button"
        className={'eb-frame-button'}
        aria-label={label}
        aria-keyshortcuts={direction < 0 ? 'Comma' : 'Period'}
        onClick={() => step(direction)}
      >
        {direction < 0 ? (
          <FrameBackIcon className={'media-button-icon'} />
        ) : (
          <FrameForwardIcon className={'media-button-icon'} />
        )}
      </Button>
    </KeyTooltip>
  );
}

/**
 * Editing-software keys. J, K, and L shuttle: L plays, and each press while playing doubles the speed up to 4x; J slows
 * back down, then steps back 10 seconds; K pauses and returns to normal speed. Comma and period step one frame.
 * Shift with the left and right arrows jumps between chapters. True
 * reverse playback isn't reliable in browsers, so J never plays backwards.
 */
export function EditBayHotkeys({ disabled = false }: { disabled?: boolean }) {
  const playback = usePlayer(selectPlayback);
  const rate = usePlayer(selectPlaybackRate);
  const time = usePlayer(selectTime);
  const step = useFrameStep();

  const current = rate?.playbackRate ?? 1;
  const faster = SHUTTLE_RATES.find((value) => value > current);
  const slower = [...SHUTTLE_RATES].reverse().find((value) => value < current);

  useHotkey({
    keys: 'l',
    disabled,
    repeatable: false,
    action: 'speedUp',
    onActivate: () => {
      if (!playback) return;
      if (playback.paused) {
        rate?.setPlaybackRate(1);
        void playback.play();
        return;
      }
      if (faster !== undefined) rate?.setPlaybackRate(faster);
    },
  });

  useHotkey({
    keys: 'j',
    disabled,
    repeatable: false,
    action: current > 1 && playback && !playback.paused ? 'speedDown' : 'seekStep',
    value: current > 1 && playback && !playback.paused ? undefined : -SEEK_STEP,
    onActivate: () => {
      if (playback && !playback.paused && current > 1) {
        rate?.setPlaybackRate(slower ?? 1);
        return;
      }
      if (time) void time.seek(Math.max(0, time.currentTime - SEEK_STEP));
    },
  });

  useHotkey({
    keys: 'k',
    disabled,
    action: 'togglePaused',
    onActivate: () => {
      if (!playback) return;
      if (playback.paused) {
        void playback.play();
        return;
      }
      playback.pause();
      if (current !== 1) rate?.setPlaybackRate(1);
    },
  });

  // Shift with the arrow keys jumps between chapters, the timeline's clips. Going back first returns to the start
  // of the current chapter, then to the one before, as a previous-track button does.
  const chapters = usePlayer(selectTextTrack)?.chaptersCues ?? [];
  const jumpChapter = (direction: 1 | -1) => {
    if (!time || chapters.length === 0) return;
    const now = time.currentTime;
    const starts = chapters.map((cue) => cue.startTime);
    const target =
      direction > 0
        ? starts.find((start) => start > now + 0.25)
        : [...starts].reverse().find((start) => start < now - 2);
    if (target !== undefined) void time.seek(target);
    else if (direction < 0) void time.seek(0);
  };

  useHotkey({
    keys: 'Shift+ArrowRight',
    disabled,
    action: 'nextChapter',
    onActivate: () => jumpChapter(1),
  });
  useHotkey({
    keys: 'Shift+ArrowLeft',
    disabled,
    action: 'previousChapter',
    onActivate: () => jumpChapter(-1),
  });

  useHotkey({
    keys: ',',
    disabled,
    action: 'frameBack',
    onActivate: () => step(-1),
  });
  useHotkey({
    keys: '.',
    disabled,
    action: 'frameForward',
    onActivate: () => step(1),
  });

  return null;
}
