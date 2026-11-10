/** @jsxImportSource react */

import { ErrorDialog as ErrorDialogPrimitive } from '@videojs/react';

import { Button } from './button';

/** Edit bay shows playback errors as an editor's "Media offline" frame, with the player's own message under it. */
export function ErrorDialog() {
  return (
    <ErrorDialogPrimitive.Root>
      <ErrorDialogPrimitive.Backdrop className={'media-dialog-backdrop eb-offline-backdrop'} />
      <ErrorDialogPrimitive.Popup className={'media-dialog-popup eb-offline'}>
        <p className={'eb-offline-label'} aria-hidden="true">
          Media offline
        </p>
        <ErrorDialogPrimitive.Title className={'media-dialog-title eb-offline-title'} />
        <ErrorDialogPrimitive.Description className={'media-dialog-description eb-offline-description'} />
        <ErrorDialogPrimitive.Close render={<Button />} className={'media-dialog-close eb-offline-close'} />
      </ErrorDialogPrimitive.Popup>
    </ErrorDialogPrimitive.Root>
  );
}
