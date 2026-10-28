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

import { uid } from './uid.js';

/**
 * Toggle switch rendered as <button role="switch" aria-checked> plus a clickable label.
 * Form-associated: submits `value` (default "on") when checked. Fires `change` on toggle.
 *
 * <mc-toggle name="pvp" checked>PvP erlaubt</mc-toggle>
 * <mc-toggle layout="row" description="Spieler können Netherportale benutzen.">Nether aktiv</mc-toggle>
 */
export class McToggle extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ['checked', 'disabled'];

  #internals = this.attachInternals();
  /** @type {HTMLButtonElement | null} */
  #switch = null;

  connectedCallback() {
    if (this.#switch) return;
    const id = uid('toggle');
    const labelText = this.textContent.trim();

    const sw = document.createElement('button');
    sw.type = 'button';
    sw.id = id;
    sw.className = 'toggle__switch';
    sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-labelledby', `${id}-label`);
    const knob = document.createElement('span');
    knob.className = 'toggle__knob';
    sw.append(knob);

    const text = document.createElement('span');
    text.className = 'toggle__text';
    const label = document.createElement('label');
    label.className = 'toggle__label';
    label.id = `${id}-label`;
    label.htmlFor = id;
    label.textContent = labelText;
    text.append(label);

    const description = this.getAttribute('description');
    if (description) {
      const desc = document.createElement('span');
      desc.className = 'toggle__description';
      desc.id = `${id}-desc`;
      desc.textContent = description;
      sw.setAttribute('aria-describedby', desc.id);
      text.append(desc);
    }

    sw.addEventListener('click', () => {
      this.checked = !this.checked;
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });

    this.replaceChildren(sw, text);
    this.#switch = sw;
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  formDisabledCallback(disabled) {
    if (this.#switch) this.#switch.disabled = disabled || this.disabled;
  }

  get checked() {
    return this.hasAttribute('checked');
  }

  set checked(value) {
    this.toggleAttribute('checked', Boolean(value));
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    this.toggleAttribute('disabled', Boolean(value));
  }

  get name() {
    return this.getAttribute('name');
  }

  #sync() {
    if (!this.#switch) return;
    this.#switch.setAttribute('aria-checked', String(this.checked));
    this.#switch.disabled = this.disabled;
    this.#internals.setFormValue(this.checked ? (this.getAttribute('value') ?? 'on') : null);
  }
}

customElements.define('mc-toggle', McToggle);
