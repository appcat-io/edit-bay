/** @jsxImportSource react */

import { selectBuffer, selectPlayback, selectTime, usePlayer } from '@videojs/react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Clean feed is the broadcast term for a picture with nothing over it. While the video plays untouched, Edit bay
 * normally leaves a thin progress line at the bottom edge. With clean feed on, that line is hidden too. It never
 * affects the panel: pausing, moving the pointer, or pressing a key brings the controls back either way.
 */
interface CleanFeedValue {
  cleanFeed: boolean;
  setCleanFeed: (value: boolean) => void;
}

const CleanFeedContext = createContext<CleanFeedValue>({ cleanFeed: false, setCleanFeed: () => {} });

const STORAGE_KEY = 'edit-bay:clean-feed';

/** Browser storage can be blocked or throw (private windows, embedded frames), so every access is guarded. */
function readStored(): boolean | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === '1' ? true : value === '0' ? false : null;
  } catch {
    return null;
  }
}

function writeStored(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // The choice still applies for this visit.
  }
}

export function CleanFeedProvider({
  defaultCleanFeed,
  onChange,
  children,
}: {
  defaultCleanFeed: boolean;
  onChange?: (cleanFeed: boolean) => void;
  children: ReactNode;
}) {
  const [cleanFeed, setValue] = useState(defaultCleanFeed);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const mounted = useRef(false);

  // Read the viewer's saved choice after mount, so server-rendered markup matches the first client render.
  useEffect(() => {
    const stored = readStored();
    if (stored !== null && stored !== defaultCleanFeed) {
      setValue(stored);
      onChangeRef.current?.(stored);
    }
    // Only on mount: the saved choice wins over the starting setting.
  }, []);

  // If the site changes its setting later, that change applies and becomes the saved choice.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setValue(defaultCleanFeed);
    writeStored(defaultCleanFeed);
  }, [defaultCleanFeed]);

  const setCleanFeed = useCallback((value: boolean) => {
    setValue(value);
    writeStored(value);
    onChangeRef.current?.(value);
  }, []);

  return <CleanFeedContext.Provider value={{ cleanFeed, setCleanFeed }}>{children}</CleanFeedContext.Provider>;
}

export function useCleanFeed() {
  return useContext(CleanFeedContext);
}

/**
 * The hairline: a 3px progress line along the bottom edge while the panel is hidden during playback. Green shows what
 * has loaded and the signal color shows the position. Decorative; the timeline slider is the accessible control.
 */
export function Hairline() {
  const { cleanFeed } = useCleanFeed();
  const playback = usePlayer(selectPlayback);
  const time = usePlayer(selectTime);
  const buffer = usePlayer(selectBuffer);

  if (cleanFeed || !playback?.started) return null;

  const duration = time?.duration ?? 0;
  if (!(duration > 0)) return null;

  const current = time?.currentTime ?? 0;
  const loadedEnd = (buffer?.buffered ?? []).reduce((end, [start, stop]) => (start <= current + 0.5 ? Math.max(end, stop) : end), 0);
  const percent = (value: number) => `${Math.min(100, Math.max(0, (value / duration) * 100))}%`;

  return (
    <div className={'eb-hairline'} aria-hidden="true">
      <div className={'eb-hairline-loaded'} style={{ width: percent(loadedEnd) }} />
      <div className={'eb-hairline-played'} style={{ width: percent(current) }} />
    </div>
  );
}
