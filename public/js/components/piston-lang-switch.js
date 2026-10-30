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

import { LOCALES, locale, setLocale, t } from '../i18n/index.js';
import { uid } from './uid.js';

/**
 * Language switch built from LOCALES: native radios in a fieldset,
 * styled as a segmented control. Languages without strings are disabled
 * and marked as planned. Choosing one stores it and reloads the page.
 *
 * <piston-lang-switch></piston-lang-switch>
 */
export class PistonLangSwitch extends HTMLElement {
  connectedCallback() {
    if (this.firstChild) return;

    const fieldset = document.createElement('fieldset');
    fieldset.className = 'lang-switch';
    // No visible legend in the sidebar – the group still needs a name for screen readers
    fieldset.setAttribute('aria-label', t('lang.label'));

    const options = document.createElement('div');
    options.className = 'lang-switch__options';
    const name = uid('lang');

    for (const { code, name: endonym, short, strings } of LOCALES) {
      const label = document.createElement('label');
      label.className = 'lang-switch__option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.value = code;
      input.checked = code === locale;
      input.disabled = !strings;

      // Visible short code; screen readers get the full name in its own language
      const visible = document.createElement('span');
      visible.setAttribute('aria-hidden', 'true');
      visible.textContent = short;
      const full = document.createElement('span');
      full.className = 'visually-hidden';
      full.lang = code;
      full.textContent = endonym;

      label.append(input, visible, full);
      if (!strings) {
        const planned = document.createElement('span');
        planned.className = 'visually-hidden';
        planned.textContent = ` (${t('lang.planned')})`;
        label.append(planned);
      }
      options.append(label);
    }

    fieldset.addEventListener('change', (event) => {
      setLocale(/** @type {HTMLInputElement} */ (event.target).value);
    });

    fieldset.append(options);
    this.append(fieldset);
  }
}

customElements.define('piston-lang-switch', PistonLangSwitch);
