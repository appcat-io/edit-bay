import { I18nProvider } from '@videojs/react/i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import { SHORTCUT_GROUPS } from '@/video/edit-bay/shortcuts';

import { Player } from '../frame/player';
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
      <header className="site-header">
        <a className="site-mark" href="./" aria-label="Edit bay home">
          <span className="site-dot" aria-hidden="true" />
          Edit bay
        </a>
        <nav aria-label="Site">
          <ul className="site-nav">
            <li>
              <a href="./workbench/">Workbench</a>
            </li>
            <li>
              <a href={REPO}>GitHub</a>
            </li>
          </ul>
        </nav>
      </header>

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
