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

const STATES = ['loading', 'online', 'offline', 'starting', 'stopping'];

/**
 * Server status: text + shape marker, never colour alone.
 * Announces changes politely to screen readers (role="status").
 *
 * <piston-status-badge status="online"></piston-status-badge>
 */
export class PistonStatusBadge extends HTMLElement {
  static observedAttributes = ['status'];

  connectedCallback() {
    this.setAttribute('role', 'status');
    this.#render();
  }

  /** @param {string} name @param {string | null} oldValue @param {string | null} newValue */
  attributeChangedCallback(name, oldValue, newValue) {
    // Pages set the status on every update – the same value again must not
    // re-render the badge, or its pulse would start over every few seconds
    if (oldValue !== newValue) this.#render();
  }

  #render() {
    if (!this.isConnected) return;
    const requested = this.getAttribute('status') ?? '';
    // Nothing known yet (no status arrived): "Lädt …", never a guessed "Offline"
    const state = STATES.includes(requested) ? requested : 'loading';
    this.dataset.state = state;

    // Every new state pulses from the start. If only the timing changes, CSS keeps the
    // old animation clock – after a long "Startet …" the pulse of "Online" would be over.
    this.style.animationName = 'none';
    void this.offsetWidth; // apply "none" before the CSS animation takes over again
    this.style.animationName = '';

    const marker = document.createElement('span');
    marker.className = 'status-badge__marker';
    marker.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.textContent = t(`status.${state}`);
    this.replaceChildren(marker, text);
  }
}

customElements.define('piston-status-badge', PistonStatusBadge);
