/** @jsxImportSource react */

import { selectMetadata, selectPlayback, selectTextTrack, selectTime, usePlayer } from '@videojs/react';
import { type FocusEvent, useEffect, useRef } from 'react';

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
  const time = usePlayer(selectTime);
  const frameRate = useFrameRate();
  const started = Boolean(playback?.started);

  // When the slate goes away with focus on it, focus would drop to the page. Move it to the panel's play button, so
  // keyboard users keep their place and the shortcuts keep working. A mouse click shows no focus ring.
  const focusedIn = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const skin = focusedIn.current;
    if (!started || !skin) return;
    focusedIn.current = null;
    const active = document.activeElement;
    if (!active || active === document.body || !active.isConnected) {
      skin.querySelector<HTMLElement>('.eb-play-button')?.focus();
    }
  }, [started]);

  if (!playback || started) return null;

  // With preload off, the browser doesn't know the length until playback starts.
  const hasDuration = (time?.duration ?? 0) > 0;

  const chapters = tracks?.chaptersCues?.length ?? 0;

  return (
    <div className={'eb-slate'}>
      <div
        className={'eb-slate-card'}
        onFocus={(event: FocusEvent<HTMLDivElement>) => {
          focusedIn.current = event.currentTarget.closest<HTMLElement>('.media-skin');
        }}
        onBlur={(event: FocusEvent<HTMLDivElement>) => {
          // Focus that moves on to another element was the viewer's choice. Removal has no next element.
          if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node))
            focusedIn.current = null;
        }}
      >
        <div className={'eb-slate-sticks'} aria-hidden="true" />
        <dl className={'eb-slate-fields'}>
          <div className={'eb-slate-field eb-slate-field-title'}>
            <dt>Sequence</dt>
            <dd>{metadata?.title || 'Untitled sequence'}</dd>
          </div>
          {hasDuration && (
            <div className={'eb-slate-field eb-slate-field-duration'}>
              <dt>Duration</dt>
              <dd className={'eb-mono'}>
                <TimecodeText type="duration" />
              </dd>
            </div>
          )}
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
