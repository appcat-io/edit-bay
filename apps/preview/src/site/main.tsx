import { I18nProvider } from '@videojs/react/i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import { SHORTCUT_GROUPS } from '@/video/edit-bay/shortcuts';

import { Player } from '../frame/player';
import { TopBar } from './top-bar';
import './site.css';

const REPO = 'https://github.com/appcat-io/edit-bay';

const NOTES = [
  {
    title: 'Timeline and transport',
    body: 'Chapters sit on V1 as colored clips and subtitles on S1. Hover the timeline for the frame, timecode, and chapter name. Timecode reads hours, minutes, seconds, and frames, and comma and period step one frame.',
  },
  {
    title: 'Hairline and clean feed',
    body: 'While the video plays, the panel hides and leaves a 3px progress line. Clean feed, in settings, removes the line too, for viewers who would rather not watch the clock. The browser remembers the choice.',
  },
  {
    title: 'Every size',
    body: 'The layout holds at every player width, not only at breakpoints. Small players get one row of controls, and settings open as a sheet over the picture.',
    link: { href: './workbench/', label: 'Resize it in the workbench' },
  },
  {
    title: 'Accessibility',
    body: 'Every control works from the keyboard and shows a red focus ring. Screen readers hear status changes. Motion calms down when reduced motion is on, and forced colors switch to system colors.',
  },
];

/** Captures of the real player in each state, served from apps/preview/public/screens at 1600×900. */
const SCREENS = [
  {
    file: 'slate',
    title: 'Slate',
    caption: 'Before play: title, duration, frame rate, and chapter count.',
    alt: 'A clapperboard slate over the poster frame, listing Tears of Steel, its duration of 00:12:14:05, 24 fps, and 9 chapters, with a play button.',
  },
  {
    file: 'timeline-preview',
    title: 'Timeline preview',
    caption: 'Point at the timeline for the frame, timecode, and chapter name.',
    alt: 'The paused player with a thumbnail above the timeline showing the frame at 00:07:35:05 and the chapter name, The attack.',
  },
  {
    file: 'playing',
    title: 'Playing',
    caption: 'The panel hides and leaves a 3px progress line. Clean feed, in settings, removes the line too.',
    alt: 'The film playing with no controls, and a thin progress line along the bottom edge.',
  },
  {
    file: 'shuttle',
    title: 'Shuttle',
    caption: 'Press L to play faster. The speed shows in red until playback returns to 1×.',
    alt: 'The player at 4× speed, with 4× highlighted in red in the sequence tab.',
  },
  {
    file: 'subtitles',
    title: 'Subtitles',
    caption: 'Captions over the picture, and every line of dialogue as a block on the S1 lane.',
    alt: 'A caption reading "We\'re on in one! All systems go! Yeah you, go!" over the picture, with subtitle blocks on the S1 lane of the timeline.',
  },
  {
    file: 'settings',
    title: 'Settings',
    caption: 'Quality, speed, captions, and Clean feed in one menu.',
    alt: 'The settings menu open above the transport, listing Quality, Speed, Captions, and Clean feed.',
  },
  {
    file: 'small-player-settings',
    title: 'Settings on a small player',
    caption: 'On small players, settings open as a sheet over the whole picture.',
    alt: 'A 360-pixel-wide player shown twice: on the left with its compact controls, on the right with the settings sheet covering it.',
  },
  {
    file: 'shortcuts',
    title: 'Keyboard shortcuts',
    caption: 'Press ? for every key the player answers to.',
    alt: 'The keyboard shortcuts sheet over the player, grouped into Transport, Timeline, and Monitor.',
  },
  {
    file: 'end-of-sequence',
    title: 'End of sequence',
    caption: 'Shown when the film ends. The play button becomes Replay.',
    alt: 'A dark frame reading End of sequence at 00:12:14:04, with the playhead at the end of the timeline.',
  },
  {
    file: 'media-offline',
    title: 'Media offline',
    caption: "Shown when the video can't load, with the error and an OK button.",
    alt: 'A full red frame reading Media offline, with the network error and an OK button.',
  },
];

const INSTALL = `git clone ${REPO}
cd edit-bay
bun install
bun run dev`;

const USAGE = `import { VideoPlayer } from '@videojs/react/video';
import { MuxVideo } from '@videojs/react/media/mux-video';
import { VideoSkin } from './video/skin';

<VideoPlayer poster={poster} title="Tears of Steel">
  <VideoSkin frameRate={24}>
    <MuxVideo src={src} playsInline />
  </VideoSkin>
</VideoPlayer>`;

function Site() {
  return (
    <>
      <a className="site-skip" href="#main">
        Skip to content
      </a>
      <TopBar current="overview" root="./" />

      <main id="main">
        <section className="site-hero" aria-labelledby="site-title">
          <h1 id="site-title">A Video.js skin that works like an edit suite</h1>
          <p className="site-lead">
            The picture is the program monitor. The controls are a timeline and transport, built from conventions
            editors already use.
          </p>
        </section>

        <section className="site-player" aria-label="Player">
          <I18nProvider locale="en">
            <Player media={{ autoPlay: false, muted: false, loop: false, preload: 'metadata' }} />
          </I18nProvider>
          {/* The film's license asks for this credit wherever it is shown. */}
          <p className="site-credit">
            Tears of Steel. (CC) Blender Foundation |{' '}
            <a href="https://mango.blender.org" target="_blank" rel="noreferrer">
              mango.blender.org
            </a>
          </p>
        </section>

        <section className="site-section" aria-labelledby="notes-title">
          <h2 id="notes-title">How it works</h2>
          <div className="site-notes">
            {NOTES.map((note) => (
              <article key={note.title} className="site-note">
                <h3>{note.title}</h3>
                <p>{note.body}</p>
                {note.link ? (
                  <p>
                    <a href={note.link.href}>{note.link.label}</a>
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="site-section" aria-labelledby="screens-title">
          <h2 id="screens-title">Every screen</h2>
          <p className="site-section-lead">Each state the player can show, captured from the player above.</p>
          <ul className="site-screens">
            {SCREENS.map((screen) => (
              <li key={screen.file}>
                <figure className="site-screen">
                  <img
                    src={`./screens/${screen.file}.webp`}
                    alt={screen.alt}
                    width={1600}
                    height={900}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    <h3>{screen.title}</h3>
                    <p>{screen.caption}</p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        <section className="site-section" aria-labelledby="keys-title">
          <h2 id="keys-title">Keyboard</h2>
          <p className="site-section-lead">
            Click the player, then use these keys. Press ? in the player for the same list.
          </p>
          <div className="site-keys">
            {SHORTCUT_GROUPS.map((group) => (
              <section key={group.title} className="site-key-group" aria-labelledby={`keys-${group.title}`}>
                <h3 id={`keys-${group.title}`}>{group.title}</h3>
                <dl>
                  {group.keys.map((item) => (
                    <div key={item.label} className="site-key-row">
                      <dt>
                        {item.keys.map((key) =>
                          key === 'to' ? (
                            <span key={key} className="site-key-word">
                              to
                            </span>
                          ) : (
                            <kbd key={key}>{key}</kbd>
                          ),
                        )}
                      </dt>
                      <dd>{item.label}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </section>

        <section className="site-section" aria-labelledby="use-title">
          <h2 id="use-title">Use it</h2>
          <p className="site-section-lead">Clone the repo and run the workbench.</p>
          <pre className="site-code">
            <code>{INSTALL}</code>
          </pre>
          <p className="site-section-lead">
            Wrap your media in the skin. Set the frame rate, since browsers don't report it.
          </p>
          <pre className="site-code">
            <code>{USAGE}</code>
          </pre>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          Built on <a href="https://videojs.org">Video.js</a> v10. Apache 2.0.
        </p>
        <p>
          By <a href="https://appcat.io">Appcat</a>
        </p>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Site />
  </StrictMode>,
);
