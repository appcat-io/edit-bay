/** @jsxImportSource react */

import { Tooltip, selectPlayback, selectPlaybackRate, selectTime, useHotkey, usePlayer } from '@videojs/react';
import type { ReactElement } from 'react';

import { Button } from '../shared/button';
import { timebase, useFrameRate } from './frame-rate';
import { FrameBackIcon, FrameForwardIcon } from './icons';

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

  return (direction: 1 | -1) => {
    if (!time) return;
    if (playback && !playback.paused) playback.pause();
    const frame = 1 / timebase(frameRate);
    // Land in the middle of the target frame, so rounding never leaves the picture on the old one.
    const index = Math.floor(time.currentTime * timebase(frameRate) + 1e-4) + direction;
    const target = Math.min(Math.max(0, (index + 0.5) * frame), Math.max(0, time.duration - frame / 2));
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
        {direction < 0 ? <FrameBackIcon className={'media-button-icon'} /> : <FrameForwardIcon className={'media-button-icon'} />}
      </Button>
    </KeyTooltip>
  );
}

/**
 * Editing-software keys. J, K, and L shuttle: L plays, and each press while playing doubles the speed up to 4x; J slows
 * back down, then steps back 10 seconds; K pauses and returns to normal speed. Comma and period step one frame. True
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

  useHotkey({ keys: ',', disabled, action: 'frameBack', onActivate: () => step(-1) });
  useHotkey({ keys: '.', disabled, action: 'frameForward', onActivate: () => step(1) });

  return null;
}
