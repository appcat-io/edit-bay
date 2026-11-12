/** @jsxImportSource react */

import {
  Slider as SliderPrimitive,
  TimeSlider as TimeSliderPrimitive,
  selectTime,
  selectVolume,
  usePlayer,
} from '@videojs/react';
import type { CSSProperties } from 'react';

import { formatTimecode, useFrameRate } from './frame-rate';
import { SubtitleLane, useSubtitlesShowing } from './subtitle-lane';

/** Ruler steps, in seconds. The timeline uses the smallest one that gives at most eight labels. */
const RULER_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];

function rulerStep(duration: number) {
  return RULER_STEPS.find((step) => duration / step <= 8) ?? 3600;
}

/** Labels start at their tick and run right, so one in the last tenth of the ruler would be cut off at its edge. */
const RULER_LABEL_LIMIT = 0.9;

/** Chapter clips cycle through four marker colors, as editors color-code clips. */
const CLIP_COLORS = 4;

export interface TimelineProps {
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps['render'];
}

/**
 * The timeline: a ruler, a V1 lane that shows each chapter as a clip, an S1 subtitle lane, an A1 lane, a render bar for what has loaded,
 * and a red playhead. The whole stack is one time slider, so a press anywhere on it moves the playhead, as in an
 * editor. Track headers sit outside the slider, so pressing them doesn't seek.
 */
export function Timeline({ renderThumbnail }: TimelineProps) {
  const time = usePlayer(selectTime);
  const volume = usePlayer(selectVolume);
  const frameRate = useFrameRate();
  const duration = time?.duration ?? 0;
  const step = duration > 0 ? rulerStep(duration) : 0;
  const labels =
    step > 0 ? Array.from({ length: Math.floor(duration / step) + 1 }, (_, index) => index * step).filter((t) => t <= duration * RULER_LABEL_LIMIT) : [];
  const muted = Boolean(volume?.muted) || volume?.volume === 0;
  const subtitles = useSubtitlesShowing();
  const rulerStyle = {
    '--eb-tick-step': step > 0 ? `${((step / 5) / duration) * 100}%` : '100%',
  } as CSSProperties;

  return (
    <div className={'eb-timeline'}>
      <div className={'eb-track-headers'} aria-hidden="true">
        <span className={'eb-track-header eb-track-header-ruler'} />
        <span className={'eb-track-header eb-track-header-v1'}>V1</span>
        <span className={'eb-track-header eb-track-header-s1'} data-muted={subtitles ? undefined : ''}>
          S1
        </span>
        <span className={'eb-track-header eb-track-header-a1'} data-muted={muted || undefined}>
          A1
        </span>
      </div>

      <TimeSliderPrimitive.Root className={'media-time-slider eb-timeline-slider'} thumbAlignment="center">
        <div className={'eb-render-bar'} aria-hidden="true">
          <div className={'eb-render-bar-fill'} />
        </div>

        <div className={'eb-ruler'} style={rulerStyle} aria-hidden="true">
          {labels.map((seconds) => (
            <span key={seconds} className={'eb-ruler-label'} style={{ left: `${(seconds / duration) * 100}%` }}>
              {formatTimecode(seconds, frameRate)}
            </span>
          ))}
        </div>

        <TimeSliderPrimitive.Chapters
          className={'media-time-slider-chapters eb-lane eb-lane-v1'}
          renderChapter={(props, state) => (
            <div className={'eb-chapter'} {...props}>
              <div
                className={'eb-clip'}
                data-gap={state.cue ? undefined : ''}
                data-color={state.index % CLIP_COLORS}
              >
                <span className={'eb-clip-marker'} aria-hidden="true" />
                <span className={'eb-clip-name'} aria-hidden="true">
                  {state.cue?.text ?? ''}
                </span>
              </div>
            </div>
          )}
        />

        <SubtitleLane />

        <div className={'eb-lane eb-lane-a1'} data-muted={muted || undefined} aria-hidden="true">
          <div className={'eb-audio-clip'} />
        </div>

        <TimeSliderPrimitive.Thumb className={'media-time-slider-thumb eb-playhead'} />

        <TimeSliderPrimitive.Preview className={'media-time-slider-preview eb-preview'}>
          <SliderPrimitive.Thumbnail.Root className={'media-slider-thumbnail eb-preview-frame'}>
            <SliderPrimitive.Thumbnail.Image render={renderThumbnail} className={'media-slider-thumbnail-image'} />
          </SliderPrimitive.Thumbnail.Root>
          <div className={'eb-preview-meta'}>
            <TimeSliderPrimitive.Value
              className={'eb-preview-timecode'}
              type="pointer"
              format={(seconds) => formatTimecode(seconds, frameRate)}
            />
            <TimeSliderPrimitive.ChapterTitle className={'eb-preview-chapter'} />
          </div>
        </TimeSliderPrimitive.Preview>
      </TimeSliderPrimitive.Root>
    </div>
  );
}
