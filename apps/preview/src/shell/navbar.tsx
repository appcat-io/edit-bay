import { ArrowTopRightOnSquareIcon, BookOpenIcon, Cog8ToothIcon } from '@heroicons/react/16/solid';
import { useSidebar } from '@preview/shell/components/ui/sidebar';
import { TopBar } from '@preview/site/top-bar';

import { skin } from './config';

type NavbarProps = {
  /** The preview on its own, to open in a new tab. */
  previewUrl: string;
  /** The options panel this bar's toggle opens and closes. */
  optionsId: string;
};

/** Edit bay's shared top bar, with the workbench's own tools at its right end. */
export function Navbar({ previewUrl, optionsId }: NavbarProps) {
  const { isMobile, open, openMobile, toggleSidebar } = useSidebar();

  return (
    <TopBar current="workbench" root="../">
      <a href={previewUrl} target="_blank" rel="noopener noreferrer" aria-label="Open the preview in a new tab">
        <ArrowTopRightOnSquareIcon aria-hidden="true" />
      </a>
      <a
        href={skin.docsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Build your own skin guide (opens in a new tab)"
      >
        <BookOpenIcon aria-hidden="true" />
      </a>
      <button
        id={`${optionsId}-trigger`}
        type="button"
        aria-label="Options"
        aria-expanded={isMobile ? openMobile : open}
        aria-controls={optionsId}
        onClick={() => {
          toggleSidebar();

          if (!isMobile && !open) {
            requestAnimationFrame(() => document.getElementById(`${optionsId}-close`)?.focus());
          }
        }}
      >
        <Cog8ToothIcon aria-hidden="true" />
      </button>
    </TopBar>
  );
}
