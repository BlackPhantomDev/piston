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

/** @typedef {import('../api.js').LogLine} LogLine */

const DEFAULT_LIMIT = 500; // same as the backend buffer (AGENTS.md §6.1)

// Chat lines look like "<Alex> hello" – the sender is highlighted
const CHAT = /^<([^<>]{1,32})> ([\s\S]*)$/;

/**
 * Console output, newest line at the bottom. Keeps at most `limit` lines.
 * Everything goes in via textContent: log lines and chat are user input.
 * `live` adds role="log" so screen readers announce new lines.
 *
 * <log-view limit="8"></log-view>   then   el.add(lines)
 */
export class LogView extends HTMLElement {
  #list = document.createElement('ol');

  connectedCallback() {
    if (this.#list.isConnected) return;
    this.#list.className = 'log';
    if (this.hasAttribute('live')) this.#list.setAttribute('role', 'log');
    this.append(this.#list);
  }

  get limit() {
    const limit = Number(this.getAttribute('limit'));
    return limit > 0 ? limit : DEFAULT_LIMIT;
  }

  /** @param {LogLine[]} lines  oldest first */
  add(lines) {
    this.#list.append(...lines.map(logLine));
    while (this.#list.childElementCount > this.limit) {
      this.#list.firstElementChild?.remove();
    }
  }

  clear() {
    this.#list.replaceChildren();
  }
}

/** @param {LogLine} line */
function logLine({ time, level, text }) {
  const li = document.createElement('li');
  li.className = `log__line log__line--${levelClass(level)}`;

  const timeEl = span('log__time', `[${time}]`);
  const levelEl = span('log__level', level);
  const textEl = span('log__text', '');

  const chat = CHAT.exec(text);
  if (chat) {
    textEl.append(span('log__player', `<${chat[1]}>`), ` ${chat[2]}`);
  } else {
    textEl.textContent = text;
  }

  li.append(timeEl, levelEl, textEl);
  return li;
}

/** @param {string} level */
function levelClass(level) {
  if (level === 'WARN') return 'warn';
  if (level === 'ERROR' || level === 'FATAL') return 'error';
  return 'info';
}

/** @param {string} className @param {string} text */
function span(className, text) {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
}

customElements.define('log-view', LogView);
