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
import { t, translate } from './i18n/index.js';
import { initNav } from './nav.js';
import { startRouter } from './router.js';
import * as home from './pages/home.js';
import * as consolePage from './pages/console.js'; // not `console` – would shadow the global
import * as settings from './pages/settings.js';

// components.html loads this module too, but has no app shell
const app = document.querySelector('.app');

if (app) {
  translate();

  const nav = initNav(
    /** @type {HTMLElement} */ (app),
    /** @type {HTMLButtonElement} */ (document.getElementById('nav-toggle')),
  );

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
