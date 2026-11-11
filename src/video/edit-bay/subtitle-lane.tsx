/** @jsxImportSource react */

import { selectTextTrack, selectTime, useMedia, usePlayer } from '@videojs/react';
import { useEffect, useState } from 'react';

interface CueSpan {
  start: number;
  end: number;
}

/** Cues closer together than this read as one block at timeline scale. */
const MERGE_GAP = 0.25;

function readCues(media: unknown): CueSpan[] {
  const tracks = (media as { textTracks?: TextTrackList } | null)?.textTracks;
  if (!tracks) return [];

  for (const track of Array.from(tracks)) {
    if (track.mode !== 'showing' || (track.kind !== 'subtitles' && track.kind !== 'captions')) continue;

    const spans: CueSpan[] = [];
    for (const cue of Array.from(track.cues ?? [])) {
      const last = spans[spans.length - 1];
      if (last && cue.startTime - last.end <= MERGE_GAP) last.end = Math.max(last.end, cue.endTime);
      else spans.push({ start: cue.startTime, end: cue.endTime });
    }
    return spans;
  }

  return [];
}

/**
 * The cues of the subtitle track that is showing. Streamed subtitles arrive in segments as the video loads, and the
 * browser adds them without an event, so the lane re-reads them once a second while subtitles are on.
 */
function useSubtitleCues(showing: boolean) {
  const media = useMedia();
  const [cues, setCues] = useState<CueSpan[]>([]);

  useEffect(() => {
    if (!showing || !media) {
      setCues([]);
      return;
    }

    const update = () =>
      setCues((current) => {
        const next = readCues(media);
        const same =
          next.length === current.length &&
          next.every((cue, i) => cue.start === current[i]!.start && cue.end === current[i]!.end);
        return same ? current : next;
      });

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [media, showing]);

  return cues;
}

/**
 * S1, the subtitle lane: each run of subtitles is a block on the timeline, as in an editor. It is empty and its header
 * is struck through while subtitles are off. Decorative; the subtitles button and menu are the controls.
 */
export function SubtitleLane() {
  const tracks = usePlayer(selectTextTrack);
  const time = usePlayer(selectTime);
  const showing = Boolean(tracks?.subtitlesShowing);
  const cues = useSubtitleCues(showing);
  const duration = time?.duration ?? 0;

  return (
    <div className={'eb-lane eb-lane-s1'} data-off={showing ? undefined : ''} aria-hidden="true">
      {duration > 0 &&
        cues.map((cue) => (
          <span
            key={cue.start}
            className={'eb-subtitle-clip'}
            style={{
              left: `${(cue.start / duration) * 100}%`,
              width: `${(Math.max(0, Math.min(cue.end, duration) - cue.start) / duration) * 100}%`,
            }}
          />
        ))}
    </div>
  );
}

/** Whether a subtitle track is showing, for the S1 track header. */
export function useSubtitlesShowing() {
  return Boolean(usePlayer(selectTextTrack)?.subtitlesShowing);
}
