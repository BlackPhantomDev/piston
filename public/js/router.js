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
 * A page module. render() may return a cleanup function that runs
 * before the next page is shown (e.g. to close a WebSocket subscription).
 * @typedef {{ titleKey: string, render: (root: HTMLElement) => (void | (() => void)) }} Page
 */

/**
 * Hash router for #/<name>. Unknown or empty hashes are replaced by the fallback.
 * After a navigation (not the first render) focus moves to the page's <h1>,
 * so screen readers announce the new page.
 *
 * @param {object} options
 * @param {Record<string, Page>} options.routes
 * @param {string} options.fallback  route name used for unknown hashes
 * @param {HTMLElement} options.outlet
 * @param {(name: string, page: Page) => void} [options.onRoute]
 */
export function startRouter({ routes, fallback, outlet, onRoute }) {
  /** @type {(() => void) | undefined} */
  let cleanup;
  let first = true;

  function show() {
    let name = location.hash.replace(/^#\//, '');
    if (!Object.hasOwn(routes, name)) {
      name = fallback;
      history.replaceState(null, '', `#/${name}`);
    }
    const page = routes[name];

    cleanup?.();
    outlet.replaceChildren();
    cleanup = page.render(outlet) ?? undefined;
    onRoute?.(name, page);

    if (!first) outlet.querySelector('h1')?.focus();
    first = false;
  }

  window.addEventListener('hashchange', show);
  show();
}
