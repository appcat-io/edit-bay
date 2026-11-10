/** @jsxImportSource react */

import { Controls } from '@videojs/react';

import { EditBayPanel } from './edit-bay/panel';
import type { ThumbnailSlot } from './shared/time-slider';

export function VideoControls({ renderThumbnail }: ThumbnailSlot = {}) {
  return (
    <Controls.Root>
      <EditBayPanel renderThumbnail={renderThumbnail} />
    </Controls.Root>
  );
}
