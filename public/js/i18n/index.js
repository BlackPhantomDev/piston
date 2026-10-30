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

import de from './de.js';
import en from './en.js';

/**
 * @typedef {object} Locale
 * @property {string} code  BCP 47 tag, also used for <html lang>
 * @property {string} name  endonym ("Deutsch", "English") – never translated
 * @property {string} short  label in the language switch
 * @property {object | null} strings  null = planned, shown disabled in the switch
 */

/**
 * Available UI languages. Adding one = new strings file + entry here.
 * The first entry is the default and the fallback for missing keys.
 * @type {Locale[]}
 */
export const LOCALES = [
  { code: 'de', name: 'Deutsch', short: 'DE', strings: de },
  { code: 'en', name: 'English', short: 'EN', strings: en },
];

const STORAGE_KEY = 'piston.locale';
const fallback = LOCALES[0];

/** @returns {Locale} */
function storedLocale() {
  let code = null;
  try {
    code = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private mode, file://) – use the default
  }
  return LOCALES.find((l) => l.code === code && l.strings) ?? fallback;
}

const active = storedLocale();
const strings = active.strings;

/** Code of the active UI language. */
export const locale = active.code;

/**
 * @param {object | null} table
 * @param {string} key
 */
function lookup(table, key) {
  const value = key.split('.').reduce((node, part) => node?.[part], table);
  return typeof value === 'string' ? value : undefined;
}

/**
 * Looks up a UI string by dot path, e.g. t('status.online').
 * Missing keys fall back to the default language, then to the key itself,
 * so gaps are visible, not empty.
 * Placeholders like {duration} are filled from params: t('server.runningFor', { duration: '3 h' }).
 * @param {string} key
 * @param {Record<string, string | number>} [params]
 * @returns {string}
 */
export function t(key, params) {
  const text = lookup(strings, key) ?? lookup(fallback.strings, key) ?? key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

/**
 * Like t(), but only from the active language – undefined instead of the German fallback.
 * For texts that already have a German source, e.g. the backend's error messages.
 * @param {string} key
 * @returns {string | undefined}
 */
export function ownString(key) {
  return lookup(strings, key);
}

/**
 * Stores the chosen language and reloads, so every page and component
 * renders with the new strings.
 * @param {string} code
 */
export function setLocale(code) {
  if (code === locale || !LOCALES.some((l) => l.code === code && l.strings)) return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    return; // cannot persist – a reload would just show the old language
  }
  location.reload();
}

const ATTR_PREFIX = 'data-i18n-';

/**
 * Fills static markup:
 *   data-i18n="key"          → text content
 *   data-i18n-label="key"    → aria-label
 *   data-i18n-<attr>="key"   → any other attribute, e.g. data-i18n-placeholder,
 *                              data-i18n-help (<mc-field>), data-i18n-description (<mc-toggle>)
 * Run it before the markup is connected, so components read translated attributes.
 * Also sets <html lang> to the active language.
 * @param {ParentNode} [root]
 */
export function translate(root = document) {
  document.documentElement.lang = locale;
  for (const el of root.querySelectorAll('*')) {
    for (const { name, value } of [...el.attributes]) {
      if (name === 'data-i18n') {
        el.textContent = t(value);
      } else if (name.startsWith(ATTR_PREFIX)) {
        const attr = name.slice(ATTR_PREFIX.length);
        el.setAttribute(attr === 'label' ? 'aria-label' : attr, t(value));
      }
    }
  }
}
