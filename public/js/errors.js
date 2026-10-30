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

// Showing what went wrong when a call of api.js fails. Errors always come with
// icon and words, never colour alone (AGENTS.md §7). Where it is shown:
//   setStatusText()  – in the status line next to the action (save bar, version switch, …)
//   showLoadError()  – in place of content that did not load, with "Erneut versuchen"
//   showError()      – as a notice at the bottom right, for actions without a place of
//                      their own (e.g. the player menu); stays until closed or the page changes

import { ApiError } from './api.js';
import { errorIcon } from './components/error-icon.js';
import { ownString, t } from './i18n/index.js';

const MAX_NOTICES = 3;

/**
 * What to tell the user: the backend's message, or a general text for anything else.
 * The backend writes German (AGENTS.md §7) – other languages look the reason up by
 * error.code in errors.codes and show the German message only for codes they lack.
 * @param {unknown} error
 */
export function errorText(error) {
  if (error instanceof ApiError) {
    const message = ownString(`errors.codes.${error.code}`) ?? error.message;
    if (message) return message;
  }
  // Not an answer of the backend – a bug in the panel. Keep it visible for debugging.
  if (!(error instanceof ApiError)) console.error(error);
  return t('errors.unknown');
}

/**
 * Fills a status line: plain text, or an error with icon (class .error-text).
 * @param {HTMLElement} el
 * @param {string} text  '' empties it
 * @param {{ error?: boolean }} [options]
 */
export function setStatusText(el, text, { error = false } = {}) {
  el.classList.toggle('error-text', error && text !== '');
  if (error && text) el.replaceChildren(errorIcon(), text);
  else el.textContent = text;
}

/** @type {WeakMap<HTMLElement, () => Promise<void>>} */
const retries = new WeakMap();

/**
 * Something did not load: shows in `slot` why, with an "Erneut versuchen" button.
 * If it fails again, only the text changes, so focus stays on the button.
 * Call hideLoadError(slot) once it worked.
 * @param {HTMLElement} slot  empty element with `hidden` where the content would be
 * @param {string} title  e.g. "Die Spielerlisten konnten nicht geladen werden."
 * @param {unknown} error
 * @param {() => Promise<void>} retry
 */
export function showLoadError(slot, title, error, retry) {
  retries.set(slot, retry);
  let text = /** @type {HTMLElement | null} */ (slot.querySelector('.load-error__text'));
  if (!text) {
    text = document.createElement('p');
    text.className = 'load-error__text';
    text.setAttribute('role', 'alert');
    const button = document.createElement('button');
    button.className = 'btn btn--secondary';
    button.type = 'button';
    button.textContent = t('errors.retry');
    button.addEventListener('click', async () => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      // aria-disabled, not disabled: the button keeps focus while it tries
      button.setAttribute('aria-disabled', 'true');
      button.textContent = t('common.loading');
      try {
        await retries.get(slot)?.();
      } finally {
        button.removeAttribute('aria-disabled');
        button.textContent = t('errors.retry');
      }
    });
    slot.classList.add('load-error');
    slot.replaceChildren(errorIcon(), text, button);
  }
  const strong = document.createElement('strong');
  strong.textContent = title;
  text.replaceChildren(strong, ' ', errorText(error));
  slot.hidden = false;
}

/** @param {HTMLElement} slot */
export function hideLoadError(slot) {
  slot.hidden = true;
  slot.replaceChildren();
  retries.delete(slot);
}

/**
 * Notice at the bottom right: what did not happen (title, from the page) and why
 * (from the backend). The same notice twice shows once; at most three at a time.
 * @param {string} title  e.g. "Backup fehlgeschlagen"
 * @param {unknown} error
 */
export function showError(title, error) {
  const list = document.getElementById('notices');
  if (!list) return;
  const message = errorText(error);
  const key = `${title}\n${message}`;
  for (const old of [...list.children]) {
    if (/** @type {HTMLElement} */ (old).dataset.key === key) old.remove();
  }

  const notice = document.createElement('div');
  notice.className = 'notice';
  notice.dataset.key = key;

  // role="alert" on the text only – the close button is not part of the announcement
  const body = document.createElement('div');
  body.className = 'notice__body';
  body.setAttribute('role', 'alert');
  const heading = document.createElement('p');
  heading.className = 'notice__title';
  heading.textContent = title;
  const text = document.createElement('p');
  text.className = 'notice__message';
  text.textContent = message;
  body.append(heading, text);

  const close = document.createElement('button');
  close.className = 'btn btn--ghost btn--icon notice__close';
  close.type = 'button';
  close.setAttribute('aria-label', t('errors.close'));
  close.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
  close.addEventListener('click', () => {
    // Focus moves on to the next notice, or back into the page
    const next = /** @type {HTMLElement | null} */ (notice.nextElementSibling ?? notice.previousElementSibling);
    notice.remove();
    const target = next?.querySelector('button') ?? document.querySelector('main:not([hidden]) h1');
    /** @type {HTMLElement | null} */ (target)?.focus();
  });

  notice.append(errorIcon(), body, close);
  list.append(notice);
  while (list.childElementCount > MAX_NOTICES) list.firstElementChild?.remove();
}

/** Removes every notice – when the page changes or the connection breaks. */
export function clearNotices() {
  document.getElementById('notices')?.replaceChildren();
}
