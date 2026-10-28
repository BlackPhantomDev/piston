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
