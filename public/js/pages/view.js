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

import { translate } from '../i18n/index.js';

/**
 * Turns a page's markup into elements and fills its data-i18n texts.
 * Only for constant markup written in code – never put server data
 * (player names, log lines, …) into the string; set it via fields() + textContent.
 * @param {string} html
 * @returns {DocumentFragment}
 */
export function view(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  translate(template.content);
  return template.content;
}

/**
 * Collects all elements with data-field="name" into { name: element }.
 * @param {ParentNode} root
 * @returns {Record<string, any>}
 */
export function fields(root) {
  /** @type {Record<string, any>} */
  const found = {};
  for (const el of root.querySelectorAll('[data-field]')) {
    found[/** @type {HTMLElement} */ (el).dataset.field ?? ''] = el;
  }
  return found;
}
