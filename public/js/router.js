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

/** @type {(() => boolean | Promise<boolean>) | null} */
let leaveGuard = null;

/**
 * Lets the page on screen hold up a navigation inside the panel, e.g. to ask
 * about unsaved changes. The guard returns (or resolves to) true to leave.
 * Call the returned function from the page's cleanup.
 * @param {() => boolean | Promise<boolean>} guard
 * @returns {() => void} removes the guard
 */
export function onBeforeLeave(guard) {
  leaveGuard = guard;
  return () => {
    if (leaveGuard === guard) leaveGuard = null;
  };
}

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
  let current = '';
  let index = -1; // position of the entry on screen in the history, kept in history.state
  let leaving = false; // a guard said yes – the next hashchange must not ask again
  let asking = false;

  /** Route name from a hash; a query behind it (#/home?sim=lost) is not part of the name. */
  function routeOf(/** @type {string} */ hash) {
    const name = hash.replace(/^#\//, '').split('?')[0];
    return Object.hasOwn(routes, name) ? name : fallback;
  }

  /** The hash to keep in the address bar: as typed for a known route, else the bare route. */
  function canonical(/** @type {string} */ name) {
    const hash = location.hash;
    return hash === `#/${name}` || hash.startsWith(`#/${name}?`) ? hash : `#/${name}`;
  }

  /** Asks the page's guard; a second navigation while it asks is refused. */
  async function mayLeave() {
    if (!leaveGuard) return true;
    if (asking) return false;
    asking = true;
    try {
      return await leaveGuard();
    } finally {
      asking = false;
    }
  }

  function show() {
    const name = routeOf(location.hash);
    // A new entry has no number yet – it comes right after the one we left
    index = history.state?.index ?? index + 1;
    history.replaceState({ ...history.state, index }, '', canonical(name));
    const page = routes[name];

    cleanup?.();
    outlet.replaceChildren();
    cleanup = page.render(outlet) ?? undefined;
    current = name;
    onRoute?.(name, page);

    if (!first) outlet.querySelector('h1')?.focus();
    first = false;
  }

  // Links inside the panel: ask before the URL changes, so history stays clean
  document.addEventListener('click', async (event) => {
    const link = /** @type {Element} */ (event.target).closest?.('a[href^="#/"]');
    if (!link || !leaveGuard || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; // new tab
    const href = /** @type {string} */ (link.getAttribute('href'));
    if (routeOf(href) === current) return;
    event.preventDefault();
    if (await mayLeave()) {
      leaving = true;
      location.hash = href;
    }
  });

  // Back / forward buttons: the URL has changed already – undo the step if the guard says no
  window.addEventListener('hashchange', async () => {
    if (routeOf(location.hash) === current) {
      // Unknown hash: the fallback is on screen already, only the URL needs fixing
      if (location.hash !== canonical(current)) history.replaceState({ ...history.state, index }, '', canonical(current));
      return;
    }
    if (!leaving && !(await mayLeave())) {
      // Back to the entry on screen: forward after "back", back after a new entry
      const target = history.state?.index;
      if (typeof target === 'number') history.go(index - target);
      else history.back();
      return;
    }
    leaving = false;
    show();
  });

  show();
}
