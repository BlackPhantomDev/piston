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

// The Minecraft EULA in the panel (AGENTS.md §6.5): PiSton never accepts it on its own.
// While eula.txt does not say eula=true, Home and Settings show this card: a link to
// the EULA, a checkbox that is never ticked in advance, and a button. Only that writes
// eula=true – through api.acceptEula().

import * as api from './api.js';
import { uid } from './components/uid.js';
import { errorText, setStatusText } from './errors.js';
import { t } from './i18n/index.js';
import { fields, view } from './pages/view.js';

const EULA_URL = 'https://aka.ms/MinecraftEULA';

const VIEW = `
  <section class="card eula" hidden data-field="card">
    <header class="card__header">
      <h2 data-i18n="eula.title" data-field="title"></h2>
    </header>
    <div class="card__body card__body--stack" data-field="body">
      <p data-i18n="eula.text"></p>
      <p>
        <a target="_blank" rel="noopener noreferrer" data-field="link"><span data-i18n="eula.link"></span><span class="visually-hidden" data-i18n="eula.newTab"></span></a>
      </p>
      <form class="eula__form" novalidate data-field="form">
        <label class="checkbox"><input type="checkbox" name="accept" data-field="checkbox"> <span data-i18n="eula.confirm"></span></label>
        <p class="form-error" role="alert" data-field="error"></p>
        <button class="btn btn--primary" type="submit" data-i18n="eula.accept"></button>
      </form>
    </div>
    <p class="eula__done" role="status" tabindex="-1" data-field="done"></p>
  </section>`;

/**
 * The EULA card. Put `el` where it belongs on the page and pass every status to update().
 * @returns {{ el: HTMLElement, update: (accepted: boolean) => void }}
 */
export function eulaNotice() {
  const f = fields(view(VIEW));
  const id = uid('eula');
  f.title.id = `${id}-title`;
  f.card.setAttribute('aria-labelledby', f.title.id);
  f.error.id = `${id}-error`;
  f.checkbox.setAttribute('aria-describedby', f.error.id);
  f.link.href = EULA_URL;

  let sending = false;
  let acceptedHere = false;

  f.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    if (!f.checkbox.checked) {
      f.checkbox.setAttribute('aria-invalid', 'true');
      setStatusText(f.error, t('eula.required'), { error: true });
      f.checkbox.focus();
      return;
    }
    sending = true;
    setStatusText(f.error, '');
    try {
      await api.acceptEula();
      acceptedHere = true;
      // The form is gone – focus goes to the confirmation, which stays until the page changes
      f.body.hidden = true;
      f.done.textContent = t('eula.accepted');
      f.done.focus();
    } catch (error) {
      setStatusText(f.error, t('eula.failed', { reason: errorText(error) }), { error: true });
    } finally {
      sending = false;
    }
  });

  f.checkbox.addEventListener('change', () => {
    if (!f.checkbox.checked) return;
    f.checkbox.removeAttribute('aria-invalid');
    setStatusText(f.error, '');
  });

  return {
    el: f.card,
    update(accepted) {
      if (!accepted) {
        acceptedHere = false;
        f.body.hidden = false;
        f.done.textContent = '';
        f.card.hidden = false;
      } else if (!acceptedHere && !sending) {
        // Accepted somewhere else (another browser, later the installer): nothing to do here
        f.card.hidden = true;
      }
    },
  };
}
