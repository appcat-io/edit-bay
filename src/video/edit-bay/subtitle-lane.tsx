/** @jsxImportSource react */

import { selectTextTrack, selectTime, useMedia, usePlayer } from '@videojs/react';
import { useEffect, useState } from 'react';

interface CueSpan {
  start: number;
  end: number;
  /** 0 for S1, 1 for S2. */
  row: number;
}

/** Subtitle lanes the timeline can show: S1, and S2 for cues that overlap one on S1. */
const MAX_ROWS = 2;

/**
 * Each cue as its own block. A cue that starts before the cue on S1 ends goes to S2, the way an editor stacks
 * overlapping clips on the next track. When both lanes are taken, it shares S2.
 */
function readCues(media: unknown): CueSpan[] {
  const tracks = (media as { textTracks?: TextTrackList } | null)?.textTracks;
  if (!tracks) return [];

  for (const track of Array.from(tracks)) {
    if (track.mode !== 'showing' || (track.kind !== 'subtitles' && track.kind !== 'captions')) continue;

    const cues = Array.from(track.cues ?? []).sort((a, b) => a.startTime - b.startTime);
    const rowEnds: number[] = [];
    return cues.map((cue) => {
      let row = rowEnds.findIndex((end) => cue.startTime >= end);
      if (row === -1) row = Math.min(rowEnds.length, MAX_ROWS - 1);
      rowEnds[row] = Math.max(rowEnds[row] ?? 0, cue.endTime);
      return { start: cue.startTime, end: cue.endTime, row };
    });
  }

  return [];
}

/**
 * The cues of the subtitle track that is showing, and how many lanes they need. Streamed subtitles arrive in segments
 * as the video loads, and the browser adds them without an event, so the lanes re-read them once a second while
 * subtitles are on.
 */
export function useSubtitleCues(showing: boolean) {
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
          next.every(
            (cue, i) => cue.start === current[i]!.start && cue.end === current[i]!.end && cue.row === current[i]!.row,
          );
        return same ? current : next;
      });

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [media, showing]);

  const rows = cues.reduce((most, cue) => Math.max(most, cue.row + 1), 1);
  return { cues, rows };
}

interface SubtitleLaneProps {
  /** 0 for S1, 1 for S2. */
  row: number;
  cues: CueSpan[];
  showing: boolean;
}

/**
 * A subtitle lane: each cue is a block on the timeline, as in an editor. S1 is empty and its header struck through
 * while subtitles are off. Decorative; the subtitles button and menu are the controls.
 */
export function SubtitleLane({ row, cues, showing }: SubtitleLaneProps) {
  const time = usePlayer(selectTime);
  const duration = time?.duration ?? 0;

  return (
    <div
      className={`eb-lane eb-lane-subtitles ${row === 0 ? 'eb-lane-s1' : 'eb-lane-s2'}`}
      data-off={showing ? undefined : ''}
      aria-hidden="true"
    >
      {duration > 0 &&
        cues
          .filter((cue) => cue.row === row)
          .map((cue) => (
            <span
              key={`${cue.start}-${cue.end}`}
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
