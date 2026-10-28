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

const SVG_NS = 'http://www.w3.org/2000/svg';
const GAP_PX = 4; // between button and menu, and to the window edge

function dotsIcon() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');
  for (const cx of [5, 12, 19]) {
    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('cx', String(cx));
    dot.setAttribute('cy', '12');
    dot.setAttribute('r', '2');
    svg.append(dot);
  }
  return svg;
}

/**
 * "⋯" button with a menu of actions, e.g. one per player.
 * Native popover: Escape, clicking outside and the top layer come from the browser;
 * arrow keys, Home and End move through the entries (ARIA menu button pattern).
 * Choosing an entry closes the menu, puts focus back on the button and fires
 * "action" with detail.value. Hidden or disabled entries are skipped.
 *
 * <action-menu label="Aktionen für Steve">
 *   <button value="tell">Nachricht senden …</button>
 *   <hr>
 *   <button value="kick" data-danger>Kicken …</button>
 * </action-menu>
 */
export class ActionMenu extends HTMLElement {
  static observedAttributes = ['label'];

  /** @type {HTMLButtonElement | undefined} */
  #trigger;
  /** @type {HTMLElement | undefined} */
  #menu;
  #focusLast = false;

  connectedCallback() {
    if (this.#trigger) return;

    const menu = document.createElement('div');
    menu.className = 'menu';
    menu.id = uid('menu');
    menu.popover = 'auto';
    menu.setAttribute('role', 'menu');

    for (const child of [...this.children]) {
      if (child instanceof HTMLHRElement) {
        child.className = 'menu__separator'; // <hr> is a separator for screen readers already
      } else {
        child.classList.add('menu__item');
        child.classList.toggle('menu__item--danger', child.hasAttribute('data-danger'));
        child.setAttribute('role', 'menuitem');
        if (child instanceof HTMLButtonElement) child.type = 'button';
        /** @type {HTMLElement} */ (child).tabIndex = -1;
      }
      menu.append(child);
    }

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'btn btn--ghost btn--icon';
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.popoverTargetElement = menu;
    trigger.append(dotsIcon());

    this.#trigger = trigger;
    this.#menu = menu;
    this.#syncLabel();
    this.append(trigger, menu);

    trigger.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      this.#focusLast = event.key === 'ArrowUp';
      if (!menu.matches(':popover-open')) menu.showPopover();
    });

    // Before showing: place it, so it never flashes in the middle of the screen
    menu.addEventListener('beforetoggle', (event) => {
      if (/** @type {ToggleEvent} */ (event).newState === 'open') this.#place();
    });

    menu.addEventListener('toggle', (event) => {
      const open = /** @type {ToggleEvent} */ (event).newState === 'open';
      trigger.setAttribute('aria-expanded', String(open));
      if (open) {
        this.#place(); // again with its real size: flips up if there is no room below
        addEventListener('scroll', this.#place, { capture: true, passive: true });
        addEventListener('resize', this.#place, { passive: true });
        const items = this.#items();
        (this.#focusLast ? items.at(-1) : items[0])?.focus();
        this.#focusLast = false;
      } else {
        this.#unlisten();
        // Escape or a click on empty space: back to the button, like the browser does for keyboard users
        const focused = document.activeElement;
        if (!focused || focused === document.body || menu.contains(focused)) {
          trigger.focus({ preventScroll: true });
        }
      }
    });

    menu.addEventListener('keydown', (event) => {
      const items = this.#items();
      const index = items.indexOf(/** @type {HTMLElement} */ (document.activeElement));
      let next;
      switch (event.key) {
        case 'ArrowDown': next = items[(index + 1) % items.length]; break;
        case 'ArrowUp': next = index <= 0 ? items.at(-1) : items[index - 1]; break;
        case 'Home': next = items[0]; break;
        case 'End': next = items.at(-1); break;
        case 'Tab':
          // Close and let Tab carry on from the button
          menu.hidePopover();
          trigger.focus();
          return;
        default: return;
      }
      event.preventDefault();
      next?.focus();
    });

    menu.addEventListener('click', (event) => {
      const item = /** @type {HTMLElement} */ (event.target).closest('[role="menuitem"]');
      if (!item || /** @type {HTMLButtonElement} */ (item).disabled) return;
      menu.hidePopover();
      // Focus first, so a dialog opened by the listener returns here when it closes
      trigger.focus();
      const value = /** @type {HTMLButtonElement} */ (item).value || (item.dataset.value ?? '');
      this.dispatchEvent(new CustomEvent('action', { bubbles: true, detail: { value } }));
    });
  }

  // Removing an open popover hides it without a toggle event
  disconnectedCallback() {
    this.#unlisten();
  }

  attributeChangedCallback() {
    this.#syncLabel();
  }

  /** Entries that can be reached right now. */
  #items() {
    return /** @type {HTMLElement[]} */ ([
      ...(this.#menu?.querySelectorAll('[role="menuitem"]:not([hidden]):not(:disabled)') ?? []),
    ]);
  }

  #syncLabel() {
    const label = this.getAttribute('label') ?? '';
    this.#trigger?.setAttribute('aria-label', label);
    this.#menu?.setAttribute('aria-label', label);
  }

  // Below the button, right edges aligned; above it if it does not fit below
  #place = () => {
    if (!this.#trigger || !this.#menu) return;
    const button = this.#trigger.getBoundingClientRect();
    const height = this.#menu.offsetHeight;
    const fitsBelow = button.bottom + GAP_PX + height <= innerHeight - GAP_PX;
    const top = fitsBelow || height === 0 ? button.bottom + GAP_PX : button.top - GAP_PX - height;
    this.#menu.style.top = `${Math.max(GAP_PX, top)}px`;
    this.#menu.style.right = `${Math.max(GAP_PX, document.documentElement.clientWidth - button.right)}px`;
  };

  #unlisten() {
    removeEventListener('scroll', this.#place, { capture: true });
    removeEventListener('resize', this.#place);
  }
}

customElements.define('action-menu', ActionMenu);
