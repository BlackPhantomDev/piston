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

// Modules without markup: versions, formatting, error texts – and the UI strings.

import { ApiError } from '../../public/js/api/error.js';
import { errorText, setStatusText } from '../../public/js/errors.js';
import { dimensionName, formatDuration, providerName } from '../../public/js/format.js';
import de from '../../public/js/i18n/de.js';
import en from '../../public/js/i18n/en.js';
import { LOCALES, ownString, t } from '../../public/js/i18n/index.js';
import { compareVersions, requiredJava } from '../../public/js/versions.js';
import { assert, deepEqual, equal, group, test } from './runner.js';

group('versions.js', () => {
  test('sorts the old and the new scheme together, pre-releases below their release', () => {
    const sorted = ['26.3', '1.21.11', '26.4-snapshot-2', '1.20.6', '26.3.1', '26.1', '26.4', '1.21', '26.4-snapshot-10'];
    sorted.sort(compareVersions);
    deepEqual(sorted, ['1.20.6', '1.21', '1.21.11', '26.1', '26.3', '26.3.1', '26.4-snapshot-2', '26.4-snapshot-10', '26.4'], 'order');
  });

  test('unknown formats sort below everything known', () => {
    equal(Math.sign(compareVersions('weird', '1.20.6')), -1, 'unknown < known');
    equal(compareVersions('26.1', '26.1.0'), 0, '26.1 = 26.1.0');
  });

  test('Java needed: 26.x → 25, 1.20.5 – 1.21.11 → 21, older → unknown', () => {
    equal(requiredJava('26.3'), 25, '26.3');
    equal(requiredJava('1.21.11'), 21, '1.21.11');
    equal(requiredJava('1.20.5'), 21, '1.20.5');
    equal(requiredJava('1.20.4'), null, '1.20.4');
    equal(requiredJava('nonsense'), null, 'nonsense');
  });
});

group('format.js', () => {
  test('durations in the coarsest useful units', () => {
    const MIN = 60_000;
    equal(formatDuration(30_000), t('duration.lessThanMinute'), '30 s');
    equal(formatDuration(47 * MIN), t('duration.minutes', { m: 47 }), '47 min');
    equal(formatDuration(192 * MIN), t('duration.hours', { h: 3, m: '12' }), '3 h 12 min');
    equal(formatDuration(65 * MIN), t('duration.hours', { h: 1, m: '05' }), 'minutes with two digits');
    equal(formatDuration((2 * 24 + 4) * 60 * MIN), t('duration.days', { d: 2, h: 4 }), '2 d 4 h');
  });

  test('provider and dimension names; unknown ids stay as they are', () => {
    equal(providerName('paper'), 'Paper', 'paper');
    equal(providerName('quilt'), 'quilt', 'unknown provider');
    equal(dimensionName('nether'), t('dimension.nether'), 'nether');
    equal(dimensionName('twilight_forest'), 'twilight_forest', 'dimension from a mod');
  });
});

group('errors.js', () => {
  test('backend errors: looked up by code, else the backend message', () => {
    equal(errorText(new ApiError('disk_full', 'Kein Platz.')), ownString('errors.codes.disk_full') ?? 'Kein Platz.', 'known code');
    equal(errorText(new ApiError('brand_new_code', 'Neue Meldung.')), 'Neue Meldung.', 'unknown code');
  });

  test('anything else is a bug in the panel: general text', () => {
    const log = console.error;
    console.error = () => {}; // errorText logs it on purpose
    try {
      equal(errorText(new TypeError('x is undefined')), t('errors.unknown'), 'TypeError');
    } finally {
      console.error = log;
    }
  });

  test('status line: an error gets an icon and the error class, text alone does not', () => {
    const el = document.createElement('p');
    setStatusText(el, 'Not saved', { error: true });
    assert(el.classList.contains('error-text') && el.querySelector('svg'), 'error with icon');
    setStatusText(el, 'Saved');
    assert(!el.classList.contains('error-text') && !el.querySelector('svg'), 'plain text');
    equal(el.textContent, 'Saved', 'text');
  });
});

group('i18n', () => {
  /** @param {object} table @returns {Map<string, string>} */
  const flat = (table, prefix = '') =>
    new Map(Object.entries(table).flatMap(([k, v]) => (typeof v === 'string' ? [[prefix + k, v]] : [...flat(v, `${prefix}${k}.`)])));
  const placeholders = (/** @type {string} */ text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  const DE = flat(de);
  const EN = flat(en);

  test('every language is registered with its strings', () => {
    deepEqual(LOCALES.map((l) => l.code), ['de', 'en'], 'locales');
    assert(LOCALES.every((l) => l.strings), 'all have strings');
  });

  test('en.js has every key of de.js – and no others besides errors.codes', () => {
    const missing = [...DE.keys()].filter((k) => !EN.has(k));
    const extra = [...EN.keys()].filter((k) => !DE.has(k) && !k.startsWith('errors.codes.'));
    deepEqual(missing, [], 'missing in en.js');
    deepEqual(extra, [], 'only in en.js');
  });

  test('same placeholders in both languages, no empty strings', () => {
    const differ = [...DE].filter(([k, v]) => EN.has(k) && placeholders(v) !== placeholders(EN.get(k))).map(([k]) => k);
    deepEqual(differ, [], 'keys with other placeholders');
    const empty = [...DE, ...EN].filter(([, v]) => !v.trim()).map(([k]) => k);
    deepEqual(empty, [], 'empty strings');
  });

  test('every error code of the demo backend has an English text', async () => {
    const source = await (await fetch('../../public/js/mock/errors.js')).text();
    // Entries look like  backup: ['disk_full', 'Auf dem Speicher …'],
    const codes = [...source.matchAll(/:\s*\[\s*'([a-z_]+)',\s*'/g)].map((m) => m[1]);
    assert(codes.length > 0, 'codes found in mock/errors.js');
    deepEqual([...new Set(codes)].filter((code) => !EN.has(`errors.codes.${code}`)), [], 'codes without a text');
  });

  test('every key in index.html exists', async () => {
    const html = await (await fetch('../../public/index.html')).text();
    const keys = [...html.matchAll(/data-i18n(?:-[\w-]+)?="([\w.]+)"/g)].map((m) => m[1]);
    assert(keys.length > 0, 'keys found');
    deepEqual(keys.filter((k) => !DE.has(k)), [], 'unknown keys');
  });
});
