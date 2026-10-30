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

import { errorIcon } from './error-icon.js';
import { uid } from './uid.js';

/**
 * Form field wrapper: label above, help text and error message below.
 * Wires label/for, aria-describedby and aria-invalid on the first control inside.
 *
 * <piston-field label="Server-Port" help="Default: 25565">
 *   <input class="input input--mono" name="server-port">
 * </piston-field>
 *
 * A child <label> is used as-is instead of the label attribute
 * (e.g. to show a live <output> value next to the text).
 */
export class PistonField extends HTMLElement {
  /** @type {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null} */
  #control = null;
  #help = null;
  #error = null;
  #errorText = null;

  connectedCallback() {
    if (this.#error) return;
    this.classList.add('field');

    const control = this.querySelector('input, select, textarea');
    this.#control = control;
    const id = control?.id || uid('field');
    if (control) control.id = id;

    let label = this.querySelector(':scope > label');
    if (!label) {
      label = document.createElement('label');
      label.textContent = this.getAttribute('label') ?? '';
      this.prepend(label);
    }
    label.classList.add('field__label');
    label.htmlFor = id;

    if (this.hasAttribute('help')) {
      this.#help = document.createElement('p');
      this.#help.className = 'field__help';
      this.#help.id = `${id}-help`;
      this.#help.textContent = this.getAttribute('help');
      this.append(this.#help);
    }

    this.#error = document.createElement('p');
    this.#error.className = 'field__error';
    this.#error.id = `${id}-error`;
    this.#error.hidden = true;
    this.#errorText = document.createElement('span');
    this.#error.append(errorIcon(), this.#errorText);
    this.append(this.#error);

    this.error = this.getAttribute('error') ?? '';
  }

  /** Current error message; empty string means valid. */
  get error() {
    return this.#errorText?.textContent ?? '';
  }

  set error(message) {
    if (!this.#error) return;
    const invalid = Boolean(message);
    this.#errorText.textContent = message ?? '';
    this.#error.hidden = !invalid;
    if (this.#help) this.#help.hidden = invalid;
    this.classList.toggle('field--invalid', invalid);

    if (!this.#control) return;
    const describedBy = invalid ? this.#error.id : this.#help?.id;
    if (describedBy) this.#control.setAttribute('aria-describedby', describedBy);
    else this.#control.removeAttribute('aria-describedby');
    if (invalid) this.#control.setAttribute('aria-invalid', 'true');
    else this.#control.removeAttribute('aria-invalid');
  }
}

customElements.define('piston-field', PistonField);
