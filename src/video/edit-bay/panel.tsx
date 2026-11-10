/** @jsxImportSource react */

import { Controls, Tooltip, VolumeSlider } from '@videojs/react';

import { CaptionsToggle } from '../shared/captions-button';
import { MuteButton } from '../shared/mute-button';
import { PlayButton } from '../shared/play-button';
import { ScreenControls } from '../shared/screen-controls';
import { SeekButton } from '../shared/seek-button';
import { SettingsMenu } from '../shared/settings-menu';
import { ButtonTooltip } from '../shared/tooltip';
import { VideoBufferingIndicator } from '../shared/video-feedback';
import { useFrameRate, formatFrameRate } from './frame-rate';
import { ShortcutsTrigger } from './shortcuts';
import { BurnIn, TimecodeReadout } from './timecode';
import { Timeline, type TimelineProps } from './timeline';
import { FrameStepButton, SEEK_STEP } from './transport';
import { Title } from '../shared/title';

function SequenceTab() {
  const frameRate = useFrameRate();
  return (
    <div className={'eb-sequence-tab'}>
      <span className={'eb-sequence-dot'} aria-hidden="true" />
      <Title />
      <span className={'eb-sequence-rate'}>{formatFrameRate(frameRate)}</span>
    </div>
  );
}

function Volume() {
  return (
    <div className={'eb-volume'}>
      <ButtonTooltip>
        <MuteButton />
      </ButtonTooltip>
      <VolumeSlider.Root className={'eb-volume-slider'} orientation="horizontal" thumbAlignment="edge">
        <VolumeSlider.Track className={'eb-volume-track'}>
          <VolumeSlider.Fill className={'eb-volume-fill'} />
        </VolumeSlider.Track>
        <VolumeSlider.Thumb className={'eb-volume-thumb'} />
      </VolumeSlider.Root>
    </div>
  );
}

/**
 * The edit suite's panel. Source order matches visual order: the sequence tab and timecode window over the picture,
 * then the timeline, then the transport row from left to right.
 */
export function EditBayPanel({ renderThumbnail }: TimelineProps) {
  return (
    <>
      <Controls.Backdrop className={'video-controls-backdrop'} />
      <VideoBufferingIndicator />
      <Controls.Content className={'video-controls-content eb-content'}>
        <Tooltip.Provider>
          <Controls.Group className={'eb-top'}>
            <SequenceTab />
            <BurnIn />
          </Controls.Group>

          <div className={'eb-panel'}>
            <Timeline renderThumbnail={renderThumbnail} />

            <Controls.Group className={'eb-transport-row'}>
              <TimecodeReadout />

              <Controls.Group className={'eb-transport'}>
                <FrameStepButton direction={-1} />
                <SeekButton className={'eb-seek-button'} seconds={-SEEK_STEP} />
                <PlayButton className={'eb-play-button'} />
                <SeekButton className={'eb-seek-button'} seconds={SEEK_STEP} />
                <FrameStepButton direction={1} />
              </Controls.Group>

              <Controls.Group className={'eb-tools'}>
                <Volume />
                <CaptionsToggle />
                <SettingsMenu />
                <ShortcutsTrigger />
                <ScreenControls />
              </Controls.Group>
            </Controls.Group>
          </div>
        </Tooltip.Provider>
      </Controls.Content>
    </>
  );
}
