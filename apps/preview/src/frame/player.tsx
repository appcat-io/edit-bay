import { MuxVideo } from '@videojs/react/media/mux-video';
import { VideoPlayer } from '@videojs/react/video';

import { VideoSkin } from '@/video/skin';

import { CLEAN_FEED_MESSAGE } from '../shell/messages';
import type { PlaybackProps } from '../shell/params';

// What the preview plays. Change these to try the skin with your own media; any Mux or HLS URL works.
const SRC = 'https://stream.mux.com/83EzHOvVzVN01AsrD01BCpiH02Pj3S8mfzBOu101w2nHC5s.m3u8';
const POSTER = 'https://image.mux.com/83EzHOvVzVN01AsrD01BCpiH02Pj3S8mfzBOu101w2nHC5s/thumbnail.webp?time=69';
/** Chapters for the time slider, served from `apps/preview/public`. */
const CHAPTERS = './cosmic-dawn-chapters.vtt';
/** The source's frame rate, for Edit bay's timecode and frame steps. Browsers don't report it, so it's set here. */
const FRAME_RATE = 30;

/** Tell the workbench shell when the viewer switches clean feed in the player's menu, so its sidebar matches. */
function reportCleanFeed(value: boolean) {
  if (window.parent !== window) window.parent.postMessage({ type: CLEAN_FEED_MESSAGE, value }, location.origin);
}

/** `media` carries the workbench's playback options: autoplay, muted, loop, and preload. */
export function Player({ media, cleanFeed = false }: { media?: PlaybackProps; cleanFeed?: boolean }) {
  return (
    <VideoPlayer poster={POSTER}>
      <VideoSkin frameRate={FRAME_RATE} cleanFeed={cleanFeed} onCleanFeedChange={reportCleanFeed}>
        <MuxVideo {...media} src={SRC} playsInline crossOrigin="">
          <track kind="chapters" label="English" srcLang="en" src={CHAPTERS} default />
        </MuxVideo>
      </VideoSkin>
    </VideoPlayer>
  );
}
