import { MuxVideo } from '@videojs/react/media/mux-video';
import { VideoPlayer } from '@videojs/react/video';

import { VideoSkin } from '@/video/skin';

import { CLEAN_FEED_MESSAGE } from '../shell/messages';
import type { PlaybackProps } from '../shell/params';

// What the preview plays: Tears of Steel, hosted on Mux. (CC) Blender Foundation | mango.blender.org, CC BY 3.0.
// Change these to try the skin with your own media; any Mux or HLS URL works.
const PLAYBACK_ID = 'j01Aln1msKJSfpmCPyoEOJrsYSlk02dCJy001DcLpieF7k';
const SRC = `https://stream.mux.com/${PLAYBACK_ID}.m3u8`;
const POSTER = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.webp?time=19`;
const TITLE = 'Tears of Steel';
/** The source's frame rate, for Edit bay's timecode and frame steps. Browsers don't report it, so it's set here. */
const FRAME_RATE = 24;
/** Chapters for the timeline, served from `apps/preview/public`. */
const CHAPTERS = './tears-of-steel-chapters.vtt';
/** Subtitles from the Blender Foundation's release, converted to WebVTT and served from `apps/preview/public`. */
const SUBTITLES = [
  { lang: 'en', label: 'English' },
  { lang: 'es', label: 'Español' },
  { lang: 'fr', label: 'Français' },
  { lang: 'de', label: 'Deutsch' },
  { lang: 'it', label: 'Italiano' },
  { lang: 'ja', label: '日本語' },
];

/** Tell the workbench shell when the viewer switches clean feed in the player's menu, so its sidebar matches. */
function reportCleanFeed(value: boolean) {
  if (window.parent !== window) window.parent.postMessage({ type: CLEAN_FEED_MESSAGE, value }, location.origin);
}

/** `media` carries the workbench's playback options: autoplay, muted, loop, and preload. */
export function Player({ media, cleanFeed = false }: { media?: PlaybackProps; cleanFeed?: boolean }) {
  return (
    <VideoPlayer poster={POSTER} title={TITLE}>
      <VideoSkin frameRate={FRAME_RATE} cleanFeed={cleanFeed} onCleanFeedChange={reportCleanFeed}>
        <MuxVideo {...media} src={SRC} playsInline crossOrigin="">
          <track kind="chapters" label="English" srcLang="en" src={CHAPTERS} default />
          {SUBTITLES.map(({ lang, label }) => (
            <track key={lang} kind="subtitles" label={label} srcLang={lang} src={`./tears-of-steel-${lang}.vtt`} />
          ))}
        </MuxVideo>
      </VideoSkin>
    </VideoPlayer>
  );
}
