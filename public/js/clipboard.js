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

import { t } from './i18n/index.js';

const RESULT_MS = 2000; // how long the result stays in the tooltip

/**
 * Wires a copy button that holds a .tooltip (see components.css): the tooltip shows
 * the result for a moment, a live region announces it. If the browser refuses,
 * onFailed() can select the text, so it can be copied by hand.
 * @param {HTMLButtonElement} button
 * @param {object} options
 * @param {() => string} options.text  what to copy, read at click time
 * @param {HTMLElement} options.status  live region (role="status")
 * @param {() => void} [options.onFailed]
 */
export function setupCopyButton(button, { text, status, onFailed }) {
  const tip = /** @type {HTMLElement | null} */ (button.querySelector('.tooltip'));
  const idle = tip?.textContent ?? '';
  let timer = 0;

  button.addEventListener('click', async () => {
    const copied = await copyText(text());
    if (!copied) onFailed?.();
    // data-state keeps the tooltip open with the result
    button.dataset.state = copied ? 'copied' : 'failed';
    if (tip) tip.textContent = t(copied ? 'copy.copied' : 'copy.failedShort');
    status.textContent = t(copied ? 'copy.copied' : 'copy.failed');
    clearTimeout(timer);
    timer = setTimeout(() => {
      delete button.dataset.state;
      if (tip) tip.textContent = idle;
      status.textContent = '';
    }, RESULT_MS);
  });
}

/**
 * Copies text to the clipboard. The Clipboard API only exists in secure contexts
 * (HTTPS, localhost) – the panel usually runs on plain HTTP in the LAN, so the
 * older execCommand('copy') on a hidden textarea is the fallback.
 * @param {string} text
 * @returns {Promise<boolean>} false if the browser allowed neither way
 */
export async function copyText(text) {
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // e.g. permission denied – try the old way
    }
  }

  const focused = /** @type {HTMLElement | null} */ (document.activeElement);
  const area = document.createElement('textarea');
  area.value = text;
  area.readOnly = true;
  area.className = 'visually-hidden';
  document.body.append(area);
  area.select();
  area.setSelectionRange(0, text.length); // iOS ignores select() alone
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  area.remove();
  focused?.focus({ preventScroll: true });
  return copied;
}
