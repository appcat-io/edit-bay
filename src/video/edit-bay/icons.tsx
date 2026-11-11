/** @jsxImportSource react */

import type { SVGProps } from 'react';

/** Stroke icons drawn for Edit bay, on the same 24px grid and stroke as the transport. */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function FrameBackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M7 6v12" />
      <path d="M17 6l-6 6 6 6" />
    </Icon>
  );
}

export function FrameForwardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M17 6v12" />
      <path d="M7 6l6 6-6 6" />
    </Icon>
  );
}

export function KeyboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3" y="6.5" width="18" height="11" rx="1.5" />
      <path d="M7 10.5h.01M10.5 10.5h.01M14 10.5h.01M17 10.5h.01M8 14h8" />
    </Icon>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

/** An empty monitor: the picture with nothing over it. */
export function CleanFeedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="12" rx="1.5" />
      <path d="M9 20h6" />
    </Icon>
  );
}
