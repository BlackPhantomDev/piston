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

// Level → line modifier; everything unknown counts as info.
// CMD = a command typed in this panel, RCON = the server's answer to it.
const LEVEL_CLASSES = { WARN: 'warn', ERROR: 'error', FATAL: 'error', CMD: 'cmd', RCON: 'rcon' };

/**
 * Console output, newest line at the bottom. Keeps at most `limit` lines.
 * Everything goes in via textContent: log lines and chat are user input.
 *
 * Attributes:
 *   limit="8"     max. lines kept (default 500)
 *   live          role="log" on the element – screen readers announce new lines.
 *                 Not on the <ol>: a list with a role loses its list items for screen readers.
 *                 Give the element a name (aria-label) and, if it scrolls, tabindex="0".
 *   follow        when the element scrolls: stay at the newest line,
 *                 unless the user has scrolled up
 *   filter="warn" show one level only: info | warn | error (CSS, see components.css)
 *
 * <log-view limit="8"></log-view>   then   el.add(lines)
 */
export class LogView extends HTMLElement {
  #list = document.createElement('ol');
  #query = '';

  connectedCallback() {
    if (this.#list.isConnected) return;
    this.#list.className = 'log';
    if (this.hasAttribute('live')) this.setAttribute('role', 'log');
    this.append(this.#list);
  }

  get limit() {
    const limit = Number(this.getAttribute('limit'));
    return limit > 0 ? limit : DEFAULT_LIMIT;
  }

  /** Text search: only lines containing it stay visible (case-insensitive). */
  get query() {
    return this.#query;
  }

  set query(value) {
    this.#query = value.trim().toLowerCase();
    for (const li of this.#list.children) this.#applyQuery(/** @type {HTMLElement} */ (li));
  }

  /** Number of kept lines, filtered ones included. */
  get lineCount() {
    return this.#list.childElementCount;
  }

  /** Lines left after the level filter and the search – 0 means the view looks empty. */
  get visibleCount() {
    const level = this.getAttribute('filter');
    return [...this.#list.children].filter(
      (li) => !(/** @type {HTMLElement} */ (li).hidden) && (!level || li.classList.contains(`log__line--${level}`)),
    ).length;
  }

  /** True when the newest line is in view (always true if the element does not scroll). */
  get atEnd() {
    return this.scrollHeight - this.scrollTop - this.clientHeight < 2;
  }

  scrollToEnd() {
    this.scrollTop = this.scrollHeight;
  }

  /** @param {LogLine[]} lines  oldest first */
  add(lines) {
    const follow = this.hasAttribute('follow') && this.atEnd;
    const items = lines.map(logLine);
    for (const li of items) this.#applyQuery(li);
    this.#list.append(...items);
    while (this.#list.childElementCount > this.limit) {
      this.#list.firstElementChild?.remove();
    }
    if (follow) this.scrollToEnd();
  }

  clear() {
    this.#list.replaceChildren();
  }

  /** All kept lines (also filtered ones) as plain text, like latest.log. */
  toText() {
    return [...this.#list.children].map((li) => /** @type {HTMLElement} */ (li).dataset.raw).join('\n');
  }

  /** @param {HTMLElement} li */
  #applyQuery(li) {
    li.hidden = this.#query !== '' && !(li.textContent ?? '').toLowerCase().includes(this.#query);
  }
}

/** @param {LogLine} line */
function logLine({ time, level, text }) {
  const li = document.createElement('li');
  li.className = `log__line log__line--${levelClass(level)}`;
  li.dataset.raw = `[${time}] [${level}]: ${text}`;

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
  return LEVEL_CLASSES[/** @type {keyof typeof LEVEL_CLASSES} */ (level)] ?? 'info';
}

/** @param {string} className @param {string} text */
function span(className, text) {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
}

customElements.define('log-view', LogView);
