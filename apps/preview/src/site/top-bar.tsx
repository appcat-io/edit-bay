import type { ReactNode } from 'react';

import './top-bar.css';

/** Where "Appcat" in the breadcrumb leads: Edit bay's card on the Appcat work page. */
const APPCAT_URL = 'https://appcat.io/work#edit-bay';
const REPO_URL = 'https://github.com/appcat-io/edit-bay';

type Page = 'overview' | 'workbench' | 'player';

type TopBarProps = {
  /** The page this bar sits on. It is marked in the links, and the player page marks none. */
  current: Page;
  /** The path from this page to the site root: './' at the root, '../' one folder down. */
  root: string;
  /** Page-specific tools, shown at the right end. */
  children?: ReactNode;
};

/**
 * The bar at the top of every Edit bay page: where you are (Appcat / Edit bay), the pages of the site, and any tools
 * the page adds. One component, so every page shows the same bar.
 */
export function TopBar({ current, root, children }: TopBarProps) {
  const links: { page: Page | 'github'; label: string; href: string; newTab?: boolean }[] = [
    { page: 'overview', label: 'Overview', href: root },
    { page: 'workbench', label: 'Workbench', href: `${root}workbench/` },
    // The repo opens in a new tab, so the player stays where the viewer left it.
    { page: 'github', label: 'GitHub', href: REPO_URL, newTab: true },
  ];

  return (
    <header className="eb-bar">
      <nav className="eb-bar-trail" aria-label="Breadcrumb">
        <ol>
          <li>
            <a className="eb-bar-parent" href={APPCAT_URL}>
              Appcat
            </a>
          </li>
          <li>
            <span className="eb-bar-slash" aria-hidden="true">
              /
            </span>
            <a className="eb-bar-name" href={root}>
              <span className="eb-bar-dot" aria-hidden="true" />
              Edit bay
            </a>
          </li>
        </ol>
      </nav>

      <nav className="eb-bar-links" aria-label="Edit bay">
        <ul>
          {links.map((link) => (
            <li key={link.page}>
              <a
                href={link.href}
                aria-current={link.page === current ? 'page' : undefined}
                {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
                {link.newTab ? <span className="eb-bar-hidden"> (opens in a new tab)</span> : null}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {children ? <div className="eb-bar-tools">{children}</div> : null}
    </header>
  );
}
