/*
 * PiSton - A tiny web panel for your Minecraft server on a Raspberry Pi
 * Copyright (C) 2026 Mischa S.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * Additional terms apply under Section 7 of the license;
 * see the ADDITIONAL_TERMS file in the root of this repository.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Sidebar navigation: marks the current route and, on narrow screens,
 * slides the sidebar in and out (state lives in .app[data-nav-open], see layout.css).
 *
 * @param {HTMLElement} app  the .app element
 * @param {HTMLButtonElement} toggle  menu button with aria-controls="<sidebar id>"
 */
export function initNav(app, toggle) {
  const sidebar = /** @type {HTMLElement} */ (document.getElementById(toggle.getAttribute('aria-controls') ?? ''));
  const backdrop = app.querySelector('.sidebar-backdrop');

  const isOpen = () => app.hasAttribute('data-nav-open');

  /** @param {boolean} open @param {boolean} [restoreFocus] */
  function setOpen(open, restoreFocus = false) {
    app.toggleAttribute('data-nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) sidebar.querySelector('a')?.focus();
    else if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  backdrop?.addEventListener('click', () => setOpen(false, true));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, true);
  });

  return {
    /** Highlights the link for the given route and closes the sliding sidebar. */
    setCurrent(/** @type {string} */ route) {
      for (const link of sidebar.querySelectorAll('[data-route]')) {
        if (/** @type {HTMLElement} */ (link).dataset.route === route) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }
      if (isOpen()) setOpen(false);
    },
  };
}
