/** @jsxImportSource react */

import { selectMetadata, selectPlayback, selectTextTrack, usePlayer } from '@videojs/react';

import { PlayButton } from '../shared/play-button';
import { formatFrameRate, useFrameRate } from './frame-rate';
import { TimecodeText } from './timecode';

/**
 * The slate, shown before playback starts: the clapperboard card an editor sees at the head of a take, with the
 * sequence's name, length, frame rate, and chapter count. Its Play button is the first stop for keyboard users.
 */
export function Slate() {
  const playback = usePlayer(selectPlayback);
  const metadata = usePlayer(selectMetadata);
  const tracks = usePlayer(selectTextTrack);
  const frameRate = useFrameRate();

  if (!playback || playback.started) return null;

  const chapters = tracks?.chaptersCues?.length ?? 0;

  return (
    <div className={'eb-slate'}>
      <div className={'eb-slate-card'}>
        <div className={'eb-slate-sticks'} aria-hidden="true" />
        <dl className={'eb-slate-fields'}>
          <div className={'eb-slate-field eb-slate-field-title'}>
            <dt>Sequence</dt>
            <dd>{metadata?.title || 'Untitled sequence'}</dd>
          </div>
          <div className={'eb-slate-field eb-slate-field-duration'}>
            <dt>Duration</dt>
            <dd className={'eb-mono'}>
              <TimecodeText type="duration" />
            </dd>
          </div>
          <div className={'eb-slate-field'}>
            <dt>Frame rate</dt>
            <dd className={'eb-mono'}>{formatFrameRate(frameRate)}</dd>
          </div>
          {chapters > 0 && (
            <div className={'eb-slate-field'}>
              <dt>Chapters</dt>
              <dd className={'eb-mono'}>{chapters}</dd>
            </div>
          )}
        </dl>
        <PlayButton className={'eb-slate-play'} tooltip={false} />
      </div>
    </div>
  );
}

/** "End of sequence", shown when playback reaches the end. The replay control is the panel's play button. */
export function EndOfSequence() {
  const playback = usePlayer(selectPlayback);
  if (!playback?.ended) return null;

  return (
    <div className={'eb-end'} aria-hidden="true">
      <span className={'eb-end-timecode'}>
        <TimecodeText type="duration" />
      </span>
      <span className={'eb-end-label'}>End of sequence</span>
    </div>
  );
}
