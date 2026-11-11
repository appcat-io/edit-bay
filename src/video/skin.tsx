/** @jsxImportSource react */

'use client';

import '../styles/video/scaffold.css';
import '../styles/themes/edit-bay.css';
import './skin.css';
import './edit-bay.css';
import { Container as ContainerPrimitive, Poster as PosterPrimitive, Slider as SliderPrimitive } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { VideoGestures } from './behaviors/gestures';
import { VideoHotkeys } from './behaviors/hotkeys';
import { VideoControls } from './controls';
import { CleanFeedProvider, Hairline, useCleanFeed } from './edit-bay/clean-feed';
import { FrameRateProvider } from './edit-bay/frame-rate';
import { ShortcutsRoot, ShortcutsSheet } from './edit-bay/shortcuts';
import { EndOfSequence, Slate } from './edit-bay/states';
import { EditBayHotkeys } from './edit-bay/transport';
import { ErrorDialog } from './shared/error-dialog';
import { Indicators } from './shared/indicators';
import { SeekIndicator } from './shared/seek-indicator';
import { StatusAnnouncer } from './shared/status-announcer';
import { Poster } from './shared/video-feedback';

export interface VideoSkinProps extends Omit<ContainerPrimitive.Props, 'children'> {
  children?: ReactNode;
  /**
   * Starts with clean feed on: no progress line over the picture while the video plays. Viewers can change it in the
   * settings menu, and their choice is remembered in the browser. Defaults to false.
   */
  cleanFeed?: boolean;
  /** Called when the viewer switches clean feed in the settings menu, or a saved choice is restored. */
  onCleanFeedChange?: (cleanFeed: boolean) => void;
  /** The source's frame rate. Browsers don't report it, and timecode and frame steps depend on it. Defaults to 30. */
  frameRate?: number;
  renderPoster?: PosterPrimitive.ImageProps['render'];
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps['render'];
}

export function VideoSkin({
  children,
  className,
  cleanFeed = false,
  onCleanFeedChange,
  frameRate = 30,
  renderPoster,
  renderThumbnail,
  ...props
}: VideoSkinProps = {}) {
  return (
    <FrameRateProvider frameRate={frameRate}>
      <CleanFeedProvider defaultCleanFeed={cleanFeed} onChange={onCleanFeedChange}>
        <SkinContainer className={className} renderPoster={renderPoster} renderThumbnail={renderThumbnail} {...props}>
          {children}
        </SkinContainer>
      </CleanFeedProvider>
    </FrameRateProvider>
  );
}

function SkinContainer({
  children,
  className,
  renderPoster,
  renderThumbnail,
  ...props
}: Omit<VideoSkinProps, 'frameRate' | 'cleanFeed' | 'onCleanFeedChange'>) {
  const { cleanFeed } = useCleanFeed();

  return (
      <ContainerPrimitive
        className={cn('media-skin', 'media-container', 'media-video', 'eb-skin', className)}
        data-theme="scaffold"
        data-preset="video"
        data-clean-feed={cleanFeed ? '' : undefined}
        {...props}
      >
        {children}
        <Poster renderImage={renderPoster} />
        <Slate />
        <EndOfSequence />
        <Hairline />
        <ErrorDialog />
        <ShortcutsRoot>
          <VideoControls renderThumbnail={renderThumbnail} />
          <ShortcutsSheet />
        </ShortcutsRoot>

        <VideoHotkeys />
        <EditBayHotkeys />
        <VideoGestures />
        <StatusAnnouncer />
        <Indicators>
          <SeekIndicator />
        </Indicators>
      </ContainerPrimitive>
  );
}
