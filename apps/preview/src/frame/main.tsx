import { I18nProvider } from '@videojs/react/i18n';
import { type CSSProperties, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import './preview.css';
import { playbackProps, playerStyles } from '../shell/params';
import { initialParams, onParamsChange } from './frame';
import { Player } from './player';
import { TopBar } from '../site/top-bar';

/** Opened on its own, not inside the workbench's frame. Only then does the page show Edit bay's top bar. */
const STANDALONE = window.parent === window;

function Preview() {
  const [params, setParams] = useState(initialParams);

  useEffect(() => onParamsChange(setParams), []);

  return (
    // The provider loads Video.js's built-in translations for the selected language.
    <I18nProvider locale={params.locale}>
      {STANDALONE ? <TopBar current="player" root="./" /> : null}
      <main className="preview-page">
        <div className="preview-player" style={playerStyles(params) as CSSProperties}>
          <Player media={playbackProps(params)} cleanFeed={params.cleanFeed} />
          {/* The film's license asks for this credit wherever it is shown. */}
          <p className="preview-credit">
            Tears of Steel. (CC) Blender Foundation |{' '}
            <a href="https://mango.blender.org" target="_blank" rel="noreferrer">
              mango.blender.org
            </a>
          </p>
        </div>
      </main>
    </I18nProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
