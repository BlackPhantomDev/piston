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

import { t } from '../i18n/index.js';

/**
 * Page title; focusable so the router can move focus here after navigation.
 * @param {string} titleKey
 */
export function pageTitle(titleKey) {
  const h1 = document.createElement('h1');
  h1.tabIndex = -1;
  h1.textContent = t(titleKey);
  return h1;
}

/** Temporary body text until a page gets real content. */
export function placeholder() {
  const p = document.createElement('p');
  p.className = 'text-muted';
  p.textContent = t('page.placeholder');
  return p;
}
