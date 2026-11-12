/** @jsxImportSource react */
import { AirPlayButtonCore, CastButtonCore } from '@videojs/core';
import { selectRemotePlayback } from '@videojs/core/dom';
import * as airplayText from '@videojs/core/i18n/text/airplay';
import * as castText from '@videojs/core/i18n/text/cast';
import { audioText, captionsText, qualityText, settingsText, speedText } from '@videojs/core/i18n/text/menu';
import { Text as TextPrimitive } from '@videojs/react';
import { Menu, usePlayer } from '@videojs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AirPlayEnterIcon as AirPlayEnterIconPrimitive,
  AirPlayExitIcon as AirPlayExitIconPrimitive,
  CastEnterIcon as CastEnterIconPrimitive,
  CastExitIcon as CastExitIconPrimitive,
  ChevronIcon as ChevronIconPrimitive,
  SwitchesIcon as SwitchesIconPrimitive,
  SpeechIcon as SpeechIconPrimitive,
  SpeedIcon as SpeedIconPrimitive,
  CaptionsOffIcon as CaptionsOffIconPrimitive,
  GearIcon as GearIconPrimitive,
} from '@videojs/react/icons/scaffold';
import { AudioTrackRadioGroup } from '@videojs/react/ui/audio-track-radio-group';
import { CaptionsRadioGroup } from '@videojs/react/ui/captions-radio-group';
import { PlaybackRateRadioGroup } from '@videojs/react/ui/playback-rate-radio-group';
import { QualityRadioGroup } from '@videojs/react/ui/quality-radio-group';

import { cn } from '@/lib/resolve-class-name';

import { useCleanFeed } from '../edit-bay/clean-feed';
import { CleanFeedIcon, CloseIcon } from '../edit-bay/icons';
import { Button } from './button';
import { CheckboxItem, RadioItem } from './menu-item';
import { ButtonTooltip } from './tooltip';

function MenuChevron({ back = false }: { back?: boolean } = {}) {
  return <ChevronIconPrimitive className={back ? 'media-menu-back-chevron' : 'media-menu-forward-chevron'} />;
}

function QualityMenu() {
  return (
    <Menu.Root>
      <QualityRadioGroup.Root>
        <Menu.Trigger className={'media-menu-item'}>
          <SwitchesIconPrimitive className={'media-menu-trigger-icon'} />
          <TextPrimitive token={qualityText.key}>{qualityText.text}</TextPrimitive>
          <span className={'media-menu-hint'}>
            <QualityRadioGroup.Value className={'media-menu-hint-label'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content className={'media-menu-content'}>
          <Menu.Item className={'media-menu-back-item'}>
            <MenuChevron back />
            <TextPrimitive token={qualityText.key}>{qualityText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'media-menu-separator'} />
          <QualityRadioGroup.Options
            className={'media-menu-radio-group'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>
                  <span>{item.label}</span>
                  {item.tier ? <sup className={'media-menu-tier'}>{item.tier}</sup> : null}
                </span>
                {item.badge ? <span className={'media-menu-badge'}>{item.badge}</span> : null}
              </RadioItem>
            )}
          ></QualityRadioGroup.Options>
        </Menu.Content>
      </QualityRadioGroup.Root>
    </Menu.Root>
  );
}

function AudioTrackMenu() {
  return (
    <Menu.Root>
      <AudioTrackRadioGroup.Root>
        <Menu.Trigger className={'media-menu-item'}>
          <SpeechIconPrimitive className={'media-menu-trigger-icon'} />
          <TextPrimitive token={audioText.key}>{audioText.text}</TextPrimitive>
          <span className={'media-menu-hint'}>
            <AudioTrackRadioGroup.Value className={'media-menu-hint-label'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content className={'media-menu-content'}>
          <Menu.Item className={'media-menu-back-item'}>
            <MenuChevron back />
            <TextPrimitive token={audioText.key}>{audioText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'media-menu-separator'} />
          <AudioTrackRadioGroup.Options
            className={'media-menu-radio-group'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>{item.label}</span>
              </RadioItem>
            )}
          ></AudioTrackRadioGroup.Options>
        </Menu.Content>
      </AudioTrackRadioGroup.Root>
    </Menu.Root>
  );
}

function PlaybackRateMenu() {
  return (
    <Menu.Root>
      <PlaybackRateRadioGroup.Root>
        <Menu.Trigger className={'media-menu-item'}>
          <SpeedIconPrimitive className={'media-menu-trigger-icon'} />
          <TextPrimitive token={speedText.key}>{speedText.text}</TextPrimitive>
          <span className={'media-menu-hint'}>
            <PlaybackRateRadioGroup.Value className={'media-menu-hint-label'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content className={'media-menu-content'}>
          <Menu.Item className={'media-menu-back-item'}>
            <MenuChevron back />
            <TextPrimitive token={speedText.key}>{speedText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'media-menu-separator'} />
          <PlaybackRateRadioGroup.Options
            className={'media-menu-radio-group'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>{item.label}</span>
              </RadioItem>
            )}
          ></PlaybackRateRadioGroup.Options>
        </Menu.Content>
      </PlaybackRateRadioGroup.Root>
    </Menu.Root>
  );
}

function CaptionsMenu() {
  return (
    <Menu.Root>
      <CaptionsRadioGroup.Root>
        <Menu.Trigger className={'media-menu-item'}>
          <CaptionsOffIconPrimitive className={'media-menu-trigger-icon'} />
          <TextPrimitive token={captionsText.key}>{captionsText.text}</TextPrimitive>
          <span className={'media-menu-hint'}>
            <CaptionsRadioGroup.Value className={'media-menu-hint-label'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content className={'media-menu-content'}>
          <Menu.Item className={'media-menu-back-item'}>
            <MenuChevron back />
            <TextPrimitive token={captionsText.key}>{captionsText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'media-menu-separator'} />
          <CaptionsRadioGroup.Options
            className={'media-menu-radio-group'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>{item.label}</span>
              </RadioItem>
            )}
          ></CaptionsRadioGroup.Options>
        </Menu.Content>
      </CaptionsRadioGroup.Root>
    </Menu.Root>
  );
}

/** Viewer switch for clean feed: no progress line over the picture while the video plays. */
function CleanFeedItem() {
  const { cleanFeed, setCleanFeed } = useCleanFeed();
  return (
    <CheckboxItem checked={cleanFeed} onCheckedChange={setCleanFeed}>
      <CleanFeedIcon className={'media-menu-trigger-icon'} />
      <span className={'eb-menu-label'}>
        <span>Clean feed</span>
        <span className={'eb-menu-note'}>No progress line while playing</span>
      </span>
      <span className={'eb-menu-state'}>{cleanFeed ? 'On' : 'Off'}</span>
    </CheckboxItem>
  );
}

/**
 * AirPlay and Cast as menu rows, for players under 62rem, where the panel has no room for their buttons. Each row uses
 * the same Video.js logic as its button and shows only while a device is available. Labels are Video.js's own, so they
 * follow the player's language.
 */
function RemotePlaybackItems() {
  const remote = usePlayer(selectRemotePlayback);
  const cores = useMemo(() => ({ airplay: new AirPlayButtonCore(), cast: new CastButtonCore() }), []);
  if (!remote) return null;

  cores.airplay.setMedia(remote);
  cores.cast.setMedia(remote);
  const airplay = cores.airplay.getState();
  const cast = cores.cast.getState();
  if (airplay.disabled && cast.disabled) return null;

  return (
    <>
      <Menu.Separator className={'media-menu-separator'} />
      {!airplay.disabled && (
        <Menu.Item className={'media-menu-item eb-menu-remote-item'} onSelect={() => cores.airplay.toggle(remote)}>
          {airplay.state === 'connected' ? (
            <AirPlayExitIconPrimitive className={'media-menu-trigger-icon'} />
          ) : (
            <AirPlayEnterIconPrimitive className={'media-menu-trigger-icon'} />
          )}
          {airplay.state === 'connected' ? (
            <TextPrimitive token={airplayText.stopText.key}>{airplayText.stopText.text}</TextPrimitive>
          ) : airplay.state === 'connecting' ? (
            <TextPrimitive token={castText.connectingText.key}>{castText.connectingText.text}</TextPrimitive>
          ) : (
            <TextPrimitive token={airplayText.startText.key}>{airplayText.startText.text}</TextPrimitive>
          )}
        </Menu.Item>
      )}
      {!cast.disabled && (
        <Menu.Item className={'media-menu-item eb-menu-remote-item'} onSelect={() => cores.cast.toggle(remote)}>
          {cast.connection === 'connected' ? (
            <CastExitIconPrimitive className={'media-menu-trigger-icon'} />
          ) : (
            <CastEnterIconPrimitive className={'media-menu-trigger-icon'} />
          )}
          {cast.connection === 'connected' ? (
            <TextPrimitive token={castText.stopText.key}>{castText.stopText.text}</TextPrimitive>
          ) : cast.connection === 'connecting' ? (
            <TextPrimitive token={castText.connectingText.key}>{castText.connectingText.text}</TextPrimitive>
          ) : (
            <TextPrimitive token={castText.startText.key}>{castText.startText.text}</TextPrimitive>
          )}
        </Menu.Item>
      )}
    </>
  );
}

/** Player width, in rem, under which the menu opens as a sheet over the whole picture. */
const SHEET_BELOW_REM = 30;

/** Player width, in rem, under which the AirPlay and Cast buttons give way to menu rows. Matches the 62rem step in CSS. */
const REMOTE_IN_MENU_BELOW_REM = 62;

/**
 * Tracks the player's width: `sheet` while it is too small for a corner menu, and `remoteInMenu` while it is too small
 * for the AirPlay and Cast buttons. Measured from the skin's own width, so it follows the player and not the window.
 * The Close row only renders in sheet mode, so it never takes keyboard focus on larger players.
 *
 * In sheet mode the player's box on screen is written to `--eb-sheet-*` properties on the skin. The popup inherits
 * them and covers the player with fixed positioning, which works in every browser, unlike CSS anchor scoping.
 */
function useSheetMode() {
  const probe = useRef<HTMLSpanElement>(null);
  const [sheet, setSheet] = useState(false);
  const [remoteInMenu, setRemoteInMenu] = useState(false);

  useEffect(() => {
    const skin = probe.current?.closest<HTMLElement>('.media-skin');
    if (!skin || typeof ResizeObserver === 'undefined') return;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSheet(entry.contentRect.width < SHEET_BELOW_REM * rem);
      setRemoteInMenu(entry.contentRect.width < REMOTE_IN_MENU_BELOW_REM * rem);
    });
    observer.observe(skin);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const skin = probe.current?.closest<HTMLElement>('.media-skin');
    if (!skin || !sheet) return;
    const place = () => {
      const box = skin.getBoundingClientRect();
      skin.style.setProperty('--eb-sheet-top', `${box.top}px`);
      skin.style.setProperty('--eb-sheet-left', `${box.left}px`);
      skin.style.setProperty('--eb-sheet-width', `${box.width}px`);
      skin.style.setProperty('--eb-sheet-height', `${box.height}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(skin);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { capture: true, passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, { capture: true });
    };
  }, [sheet]);

  return { probe, sheet, remoteInMenu };
}

export function SettingsMenu() {
  const { probe, sheet, remoteInMenu } = useSheetMode();

  return (
    <>
      <span ref={probe} hidden />
      <Menu.Root side="top" align="center">
        <ButtonTooltip label={<TextPrimitive token={settingsText.key}>{settingsText.text}</TextPrimitive>}>
          <Menu.Trigger render={<Button />}>
            <GearIconPrimitive className={'media-button-icon'} />
            <TextPrimitive className={'media-settings-button-label'} token={settingsText.key}>
              {settingsText.text}
            </TextPrimitive>
          </Menu.Trigger>
        </ButtonTooltip>
        <Menu.Popup
          keepMounted
          className={cn('media-popup', 'media-popup-safe-area', 'media-menu-popup', sheet && 'eb-menu-sheet')}
        >
          <Menu.Content className={'media-menu-content'}>
            {/* On small players the menu fills the picture as a sheet, and this row closes it. */}
            {sheet && (
              <Menu.Item className={'media-menu-back-item eb-menu-close'}>
                <span className={'eb-menu-close-title'}>
                  <TextPrimitive token={settingsText.key}>{settingsText.text}</TextPrimitive>
                </span>
                <span className={'eb-menu-close-action'}>
                  Close
                  <CloseIcon className={'eb-menu-close-icon'} />
                </span>
              </Menu.Item>
            )}
            <QualityMenu />
            <AudioTrackMenu />
            <PlaybackRateMenu />
            <CaptionsMenu />
            {remoteInMenu && <RemotePlaybackItems />}
            <Menu.Separator className={'media-menu-separator'} />
            <CleanFeedItem />
          </Menu.Content>
        </Menu.Popup>
      </Menu.Root>
    </>
  );
}
