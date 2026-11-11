/** @jsxImportSource react */

import { Time, selectTime, usePlayer } from '@videojs/react';
import { useState } from 'react';

import { formatTimecode, useFrameRate } from './frame-rate';

/** Current time as timecode, for places that only display it. Screen readers get the player's own time text. */
export function TimecodeText({ type }: { type: 'current' | 'duration' | 'remaining' }) {
  const time = usePlayer(selectTime);
  const frameRate = useFrameRate();
  const current = time?.currentTime ?? 0;
  const duration = time?.duration ?? 0;
  const value = type === 'current' ? current : type === 'duration' ? duration : Math.max(0, duration - current);
  return (
    <>
      {type === 'remaining' ? '-' : ''}
      {formatTimecode(value, frameRate)}
    </>
  );
}

/** The burned-in timecode window over the picture: white monospace on solid black, legible over any footage. */
export function BurnIn() {
  return (
    <div className={'eb-burn-in'} aria-hidden="true">
      <TimecodeText type="current" />
    </div>
  );
}

/**
 * The panel's timecode readout. Pressing it switches between elapsed and remaining time, as an editor's timecode
 * field does. The visible timecode is hidden from screen readers, which hear the player's spoken time instead.
 */
export function TimecodeReadout() {
  const [remaining, setRemaining] = useState(false);
  const time = usePlayer(selectTime);
  const hasDuration = (time?.duration ?? 0) > 0;

  return (
    <div className={'eb-timecode'}>
      <button
        type="button"
        className={'eb-timecode-button'}
        aria-pressed={remaining}
        aria-label={remaining ? 'Show elapsed time' : 'Show remaining time'}
        onClick={() => setRemaining((value) => !value)}
      >
        <span className={'eb-timecode-current'} aria-hidden="true">
          <TimecodeText type={remaining ? 'remaining' : 'current'} />
        </span>
      </button>
      <span className={'eb-timecode-duration'} aria-hidden="true" hidden={!hasDuration}>
        <span className={'eb-timecode-slash'}>/</span>
        <TimecodeText type="duration" />
      </span>
      <Time.Group className={'eb-sr-only'}>
        <Time.Value type="current" />
        <Time.Separator />
        <Time.Value type="duration" />
      </Time.Group>
    </div>
  );
}
