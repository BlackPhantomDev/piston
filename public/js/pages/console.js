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

import * as api from '../api.js';
import { formatLogTime } from '../format.js';
import { t } from '../i18n/index.js';
import { fields, view } from './view.js';

export const titleKey = 'nav.console';

// Chips below the console. A trailing space means "needs an argument":
// the command goes into the input and the cursor waits behind it.
const COMMON_COMMANDS = ['list', 'save-all', 'time set day', 'weather clear', 'whitelist add ', 'op ', 'kick ', 'say '];

const HISTORY_MAX = 50;
/** Sent commands, oldest first – module scope, so it survives switching pages. */
const history = [];

// Page skeleton (mockup 03): texts via data-i18n, data slots via data-field.
const VIEW = `
  <header class="page__header">
    <div class="page__heading">
      <h1 tabindex="-1" data-i18n="nav.console"></h1>
      <div class="page__status">
        <status-badge data-field="state"></status-badge>
        <p class="page__meta" data-i18n="console.subtitle"></p>
      </div>
    </div>

    <div class="page__actions">
      <button class="btn btn--secondary" type="button" data-field="downloadBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><polyline points="7 10 12 15 17 10"/><line x1="5" y1="20" x2="19" y2="20"/></svg>
        <span data-i18n="console.download"></span>
      </button>
      <button class="btn btn--ghost" type="button" data-field="clearBtn" data-i18n="console.clear"></button>
    </div>
  </header>

  <div class="page__toolbar">
    <fieldset class="choice-chips" data-field="filter">
      <legend class="visually-hidden" data-i18n="console.filter.label"></legend>
      <label class="choice-chip"><input type="radio" name="console-level" value="all" checked><span data-i18n="console.filter.all"></span></label>
      <label class="choice-chip"><input type="radio" name="console-level" value="info"><span data-i18n="console.filter.info"></span></label>
      <label class="choice-chip"><input type="radio" name="console-level" value="warn"><span data-i18n="console.filter.warn"></span></label>
      <label class="choice-chip"><input type="radio" name="console-level" value="error"><span data-i18n="console.filter.error"></span></label>
    </fieldset>
    <input class="input page__search" type="search" autocomplete="off" data-field="search"
           data-i18n-placeholder="console.search" data-i18n-label="console.search">
  </div>

  <section class="console-panel">
    <log-view class="console-panel__output log--lg" live follow tabindex="0"
              data-i18n-label="console.output" data-field="log"></log-view>
    <p class="console-panel__empty" data-i18n="console.loading" data-field="empty"></p>
    <button class="btn btn--secondary btn--s console-panel__jump" type="button" hidden data-field="jumpBtn">
      <span data-i18n="console.jump"></span><span aria-hidden="true">↓</span>
    </button>
    <form class="console-input" data-field="form">
      <span class="console-input__prompt" aria-hidden="true">&gt;</span>
      <input name="command" maxlength="256" autocomplete="off" autocapitalize="off" spellcheck="false" disabled
             data-field="input" data-i18n-label="console.input.label" data-i18n-placeholder="console.input.loading">
      <button class="btn btn--primary btn--s" type="submit" disabled data-field="sendBtn" data-i18n="console.send"></button>
    </form>
  </section>

  <section class="page-section" aria-labelledby="console-common">
    <div class="page-section__head">
      <h2 id="console-common" data-i18n="console.common.title"></h2>
      <p class="page-section__hint" data-i18n="console.common.hint"></p>
    </div>
    <ul class="chip-list" data-field="chips"></ul>
  </section>`;

/** @param {HTMLElement} root */
export function render(root) {
  root.append(view(VIEW));
  const f = fields(root);

  f.chips.append(...COMMON_COMMANDS.map(commandChip));

  // ---------- Server state: commands need a running server ----------

  function updateStatus(status) {
    f.state.setAttribute('status', status.state);
    const online = status.state === 'online';
    f.input.disabled = !online;
    f.sendBtn.disabled = !online;
    for (const chip of f.chips.querySelectorAll('button')) chip.disabled = !online;
    f.input.placeholder = t(online ? 'console.input.placeholder' : 'console.input.offline');
  }

  // ---------- Output: follow new lines, offer a jump back when scrolled up ----------

  let received = false; // the buffer has arrived – before that the output says "Lädt …"

  function addLines(lines) {
    received = true;
    f.log.add(lines);
    f.jumpBtn.hidden = f.log.atEnd;
    updateEmpty();
  }

  // An empty output says why: still loading, nothing written yet, or nothing matches
  function updateEmpty() {
    const empty = f.log.visibleCount === 0;
    f.empty.hidden = !empty;
    if (!empty) return;
    if (!received) f.empty.textContent = t('console.loading');
    else f.empty.textContent = t(f.log.lineCount === 0 ? 'console.empty' : 'console.noMatch');
  }

  function jumpToEnd() {
    f.log.scrollToEnd();
    f.jumpBtn.hidden = true;
  }

  f.log.addEventListener('scroll', () => {
    if (f.log.atEnd) f.jumpBtn.hidden = true;
  });

  f.jumpBtn.addEventListener('click', () => {
    jumpToEnd();
    f.log.focus(); // the button disappears – keep focus on the output
  });

  f.filter.addEventListener('change', (event) => {
    const level = event.target.value;
    if (level === 'all') f.log.removeAttribute('filter');
    else f.log.setAttribute('filter', level);
    jumpToEnd();
    updateEmpty();
  });

  f.search.addEventListener('input', () => {
    f.log.query = f.search.value;
    jumpToEnd();
    updateEmpty();
  });

  f.downloadBtn.addEventListener('click', () => downloadText(f.log.toText()));

  f.clearBtn.addEventListener('click', () => {
    f.log.clear();
    f.jumpBtn.hidden = true;
    updateEmpty();
  });

  // ---------- Command line: send, history with ↑/↓ ----------

  let historyIndex = -1; // -1 = not browsing, typing a new command
  let draft = '';

  f.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const command = normalizeCommand(f.input.value);
    if (!command) return;

    if (history.at(-1) !== command) history.push(command);
    if (history.length > HISTORY_MAX) history.shift();
    historyIndex = -1;
    f.input.value = '';

    addLines([{ time: formatLogTime(), level: 'CMD', text: command }]);
    jumpToEnd(); // own command: always show it, even when scrolled up
    const response = await api.sendCommand(command);
    addLines(response.map((text) => ({ time: formatLogTime(), level: 'RCON', text })));
  });

  f.input.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    if (history.length === 0) return;
    event.preventDefault();

    if (event.key === 'ArrowUp') {
      if (historyIndex === -1) {
        draft = f.input.value;
        historyIndex = history.length - 1;
      } else {
        historyIndex = Math.max(0, historyIndex - 1);
      }
    } else if (historyIndex !== -1) {
      historyIndex += 1;
      if (historyIndex >= history.length) historyIndex = -1;
    }
    setInput(historyIndex === -1 ? draft : history[historyIndex]);
  });

  f.chips.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-command]');
    if (!chip || chip.disabled) return;
    setInput(chip.dataset.command);
  });

  /** Puts text into the command line with the cursor at the end. */
  function setInput(text) {
    f.input.value = text;
    f.input.focus();
    f.input.setSelectionRange(text.length, text.length);
  }

  const stopStatus = api.onStatus(updateStatus);
  const stopLog = api.onLog(addLines);

  return () => {
    stopStatus();
    stopLog();
  };
}

/** @param {string} command */
function commandChip(command) {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.className = 'chip';
  button.type = 'button';
  button.disabled = true; // until the first status says the server is online
  button.dataset.command = command;
  button.textContent = command.trim();
  li.append(button);
  return li;
}

/**
 * One line, no leading slash (RCON takes commands without it), single spaces.
 * @param {string} raw
 */
function normalizeCommand(raw) {
  return raw.replace(/\s+/g, ' ').trim().replace(/^\//, '');
}

/**
 * Saves what the console shows as a .log file. This is the panel's buffer
 * (up to 500 lines), not the whole latest.log on the server.
 * @param {string} text
 */
function downloadText(text) {
  const url = URL.createObjectURL(new Blob([text + '\n'], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `piston-console-${new Date().toISOString().slice(0, 10)}.log`;
  link.click();
  URL.revokeObjectURL(url);
}
