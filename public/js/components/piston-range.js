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
 * Range slider: paints the filled part of the track (WebKit has no
 * ::-moz-range-progress) and mirrors the value into <output for="…">.
 *
 * <piston-range><input type="range" id="view-distance" min="2" max="32" value="10"></piston-range>
 */
export class PistonRange extends HTMLElement {
  /** @type {HTMLInputElement | null} */
  #input = null;

  connectedCallback() {
    if (this.#input) return;
    const input = this.querySelector('input[type="range"]');
    if (!input) return;
    this.#input = input;
    input.classList.add('range');
    input.addEventListener('input', () => this.refresh());
    this.refresh();
  }

  /** Call after setting the value from code (no input event fires then). */
  refresh() {
    const input = this.#input;
    if (!input) return;
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const percent = max > min ? ((input.valueAsNumber - min) / (max - min)) * 100 : 0;
    input.style.setProperty('--range-fill', `${percent}%`);

    if (!input.id) return;
    for (const output of document.querySelectorAll(`output[for~="${CSS.escape(input.id)}"]`)) {
      output.value = input.value;
    }
  }
}

customElements.define('piston-range', PistonRange);
