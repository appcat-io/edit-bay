/** @jsxImportSource react */

import { Dialog, useHotkey } from '@videojs/react';
import { useState, type ReactNode } from 'react';

import { Button } from '../shared/button';
import { CloseIcon, KeyboardIcon } from './icons';
import { KeyTooltip, SEEK_STEP } from './transport';

const GROUPS: { title: string; keys: { keys: string[]; label: string }[] }[] = [
  {
    title: 'Transport',
    keys: [
      { keys: ['Space'], label: 'Play or pause' },
      { keys: ['K'], label: 'Pause and return to normal speed' },
      { keys: ['L'], label: 'Play, then 2× and 4×' },
      { keys: ['J'], label: `Slower, then back ${SEEK_STEP} seconds` },
      { keys: [','], label: 'Previous frame' },
      { keys: ['.'], label: 'Next frame' },
    ],
  },
  {
    title: 'Timeline',
    keys: [
      { keys: ['←', '→'], label: `Back or forward ${SEEK_STEP} seconds` },
      { keys: ['Home'], label: 'Start of sequence' },
      { keys: ['End'], label: 'End of sequence' },
      { keys: ['0', 'to', '9'], label: 'Jump to 0% through 90%' },
      { keys: ['<', '>'], label: 'Slower or faster' },
    ],
  },
  {
    title: 'Monitor',
    keys: [
      { keys: ['↑', '↓'], label: 'Volume up or down' },
      { keys: ['M'], label: 'Mute' },
      { keys: ['C'], label: 'Subtitles' },
      { keys: ['F'], label: 'Full screen' },
      { keys: ['I'], label: 'Pop-out viewer' },
      { keys: ['?'], label: 'This list' },
    ],
  },
];

/**
 * Holds the shortcuts sheet's open state around the whole skin, so the trigger can sit in the panel while the sheet
 * covers the full picture. ? opens it; Escape or Close closes it and returns focus to the trigger.
 */
export function ShortcutsRoot({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useHotkey({ keys: '?', action: 'showShortcuts', repeatable: false, onActivate: () => setOpen(true) });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
    </Dialog.Root>
  );
}

export function ShortcutsTrigger() {
  return (
    <KeyTooltip label="Keyboard shortcuts" shortcut="?">
      <Dialog.Trigger render={<Button />} className={'eb-shortcuts-button'} aria-label="Keyboard shortcuts">
        <KeyboardIcon className={'media-button-icon'} />
      </Dialog.Trigger>
    </KeyTooltip>
  );
}

export function ShortcutsSheet() {
  return (
    <>
      <Dialog.Backdrop className={'eb-dialog-backdrop'} />
      <Dialog.Popup className={'eb-shortcuts'}>
        <div className={'eb-shortcuts-header'}>
          <Dialog.Title className={'eb-shortcuts-title'}>Keyboard shortcuts</Dialog.Title>
          <Dialog.Close render={<Button />} className={'eb-shortcuts-close'} aria-label="Close">
            <CloseIcon className={'media-button-icon'} />
          </Dialog.Close>
        </div>
        <div className={'eb-shortcuts-groups'}>
          {GROUPS.map((group) => (
            <section key={group.title} className={'eb-shortcuts-group'} aria-label={group.title}>
              <h3 className={'eb-shortcuts-group-title'}>{group.title}</h3>
              <dl className={'eb-shortcuts-list'}>
                {group.keys.map((item) => (
                  <div key={item.label} className={'eb-shortcuts-item'}>
                    <dt className={'eb-shortcuts-keys'}>
                      {item.keys.map((key) =>
                        key === 'to' ? (
                          <span key={key} className={'eb-key-range'}>
                            to
                          </span>
                        ) : (
                          <kbd key={key} className={'eb-key'}>
                            {key}
                          </kbd>
                        )
                      )}
                    </dt>
                    <dd className={'eb-shortcuts-label'}>{item.label}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </Dialog.Popup>
    </>
  );
}
