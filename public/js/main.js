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

import './components/index.js';
import { onStatus } from './api.js';
import { setupCopyButton } from './clipboard.js';
import { initConnectionView } from './connection-view.js';
import { t, translate } from './i18n/index.js';
import { initNav } from './nav.js';
import { startRouter } from './router.js';
import * as home from './pages/home.js';
import * as consolePage from './pages/console.js'; // not `console` – would shadow the global
import * as settings from './pages/settings.js';
import { VERSION } from './version.js';

// Version next to the attribution in the footer (index.html and components.html)
for (const el of document.querySelectorAll('[data-version]')) el.textContent = VERSION;

// components.html loads this module too, but has no app shell
const app = document.querySelector('.app');

if (app) {
  translate();

  const nav = initNav(
    /** @type {HTMLElement} */ (app),
    /** @type {HTMLButtonElement} */ (document.getElementById('nav-toggle')),
  );

  // Server name and address in the sidebar – subscribed for as long as the panel is open
  const serverName = /** @type {HTMLElement} */ (document.getElementById('server-name'));
  const serverAddress = /** @type {HTMLElement} */ (document.getElementById('server-address'));
  const copyButton = /** @type {HTMLButtonElement} */ (document.getElementById('copy-address'));
  onStatus((status) => {
    serverName.textContent = status.name;
    serverAddress.textContent = status.address;
    copyButton.disabled = !status.address;
  });

  // Copy "IP:Port" – if the browser refuses, the address is selected for copying by hand
  setupCopyButton(copyButton, {
    text: () => serverAddress.textContent ?? '',
    status: /** @type {HTMLElement} */ (document.getElementById('copy-address-status')),
    onFailed: () => getSelection()?.selectAllChildren(serverAddress),
  });

  // Lost connection to the panel: banner, then the "Panel nicht erreichbar" screen (mockups 06)
  initConnectionView(/** @type {HTMLElement} */ (document.getElementById('main')));

  // Skip link: focus the page content without touching the hash – it holds the route.
  // While the panel is unreachable, its screen is the visible <main>.
  document.querySelector('.skip-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    const main = /** @type {HTMLElement} */ (document.querySelector('main:not([hidden])'));
    /** @type {HTMLElement} */ (main.querySelector('h1') ?? main).focus();
  });

  startRouter({
    routes: { home, console: consolePage, settings },
    fallback: 'home',
    outlet: /** @type {HTMLElement} */ (document.getElementById('main')),
    onRoute(name, page) {
      document.title = `${t(page.titleKey)} – PiSton`;
      nav.setCurrent(name);
    },
  });
}
