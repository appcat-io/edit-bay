/** @jsxImportSource react */

import { Controls } from '@videojs/react';

import { EditBayPanel } from './edit-bay/panel';
import type { TimelineProps } from './edit-bay/timeline';

export function VideoControls({ renderThumbnail }: TimelineProps = {}) {
  return (
    <Controls.Root>
      <EditBayPanel renderThumbnail={renderThumbnail} />
    </Controls.Root>
  );
}
