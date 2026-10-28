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
import { uid } from './components/uid.js';

/**
 * Asks before something risky. Native <dialog>: focus trap, Escape and
 * returning focus come from the browser. Focus starts on "Abbrechen",
 * so Enter alone never confirms a dangerous action.
 *
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.text
 * @param {string} options.confirmLabel
 * @param {boolean} [options.danger]  red confirm button
 * @returns {Promise<boolean>} true if confirmed
 */
export function confirmDialog({ title, text, confirmLabel, danger = false }) {
  const id = uid('confirm');
  const dialog = document.createElement('dialog');
  dialog.className = 'dialog';
  dialog.setAttribute('aria-labelledby', `${id}-title`);
  dialog.setAttribute('aria-describedby', `${id}-text`);

  const form = document.createElement('form');
  form.className = 'dialog__form';
  form.method = 'dialog';

  const heading = document.createElement('h2');
  heading.id = `${id}-title`;
  heading.textContent = title;

  const body = document.createElement('p');
  body.id = `${id}-text`;
  body.textContent = text;

  const actions = document.createElement('div');
  actions.className = 'dialog__actions';
  const cancel = button('btn btn--ghost', t('common.cancel'), 'cancel');
  const confirm = button(`btn ${danger ? 'btn--danger' : 'btn--primary'}`, confirmLabel, 'confirm');
  actions.append(cancel, confirm);

  form.append(heading, body, actions);
  dialog.append(form);
  document.body.append(dialog);

  return new Promise((resolve) => {
    dialog.addEventListener('close', () => {
      resolve(dialog.returnValue === 'confirm');
      dialog.remove();
    });
    dialog.showModal();
    cancel.focus();
  });
}

/** @param {string} className @param {string} label @param {string} value */
function button(className, label, value) {
  const el = document.createElement('button');
  el.className = className;
  el.value = value;
  el.textContent = label;
  return el;
}
