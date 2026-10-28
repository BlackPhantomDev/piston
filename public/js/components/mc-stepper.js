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
 * Number input with − / + buttons. The native input stays the source of truth
 * (name, min, max, step, form submission, arrow keys).
 *
 * <mc-stepper><input type="number" name="max-players" min="1" max="100" value="20"></mc-stepper>
 */
export class McStepper extends HTMLElement {
  /** @type {HTMLInputElement | null} */
  #input = null;
  #decrease = null;
  #increase = null;

  connectedCallback() {
    if (this.#input) return;
    const input = this.querySelector('input[type="number"]');
    if (!input) return;
    this.#input = input;
    this.classList.add('input-group', 'stepper');

    // Keyboard users step with the arrow keys, so the buttons skip the tab order.
    this.#decrease = this.#button('−', t('stepper.decrease'), () => input.stepDown());
    this.#increase = this.#button('+', t('stepper.increase'), () => input.stepUp());
    this.prepend(this.#decrease);
    this.append(this.#increase);

    input.addEventListener('input', () => this.#sync());
    this.#sync();
  }

  #button(symbol, label, step) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stepper__btn';
    button.tabIndex = -1;
    button.setAttribute('aria-label', label);
    button.textContent = symbol;
    button.addEventListener('click', () => {
      step();
      this.#input.dispatchEvent(new Event('input', { bubbles: true }));
      this.#input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    return button;
  }

  #sync() {
    const { min, max, valueAsNumber: value, disabled } = this.#input;
    this.#decrease.disabled = disabled || (min !== '' && value <= Number(min));
    this.#increase.disabled = disabled || (max !== '' && value >= Number(max));
  }
}

customElements.define('mc-stepper', McStepper);
