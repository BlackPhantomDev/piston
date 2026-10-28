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

// Turns raw API values into display text. Units and wording come from i18n.

import { locale, t } from './i18n/index.js';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Product names – not translated
const PROVIDER_NAMES = { vanilla: 'Vanilla', paper: 'Paper', fabric: 'Fabric' };

/**
 * Duration in the coarsest useful units: "47 min", "3 h 12 min", "2 d 4 h".
 * @param {number} ms
 */
export function formatDuration(ms) {
  if (ms < MINUTE) return t('duration.lessThanMinute');
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / HOUR);
  const m = Math.floor((ms % HOUR) / MINUTE);
  if (d > 0) return t('duration.days', { d, h });
  if (h > 0) return t('duration.hours', { h, m: String(m).padStart(2, '0') });
  return t('duration.minutes', { m });
}

/**
 * Time since an ISO date, e.g. for "läuft seit 3 h 12 min".
 * @param {string} isoDate
 */
export function formatSince(isoDate) {
  return formatDuration(Math.max(0, Date.now() - Date.parse(isoDate)));
}

const clock = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
const dayMonth = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' });

/**
 * Point in time relative to today: "heute 06:00", "gestern 22:15", "12.10. 06:00".
 * @param {string} isoDate
 */
export function formatWhen(isoDate) {
  const date = new Date(isoDate);
  const time = clock.format(date);
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY);
  if (days === 0) return t('when.today', { time });
  if (days === 1) return t('when.yesterday', { time });
  return t('when.date', { date: dayMonth.format(date), time });
}

/** @param {Date} date */
function startOfDay(date) {
  return new Date(date).setHours(0, 0, 0, 0);
}

/** @param {string} id  'vanilla' | 'paper' | 'fabric' */
export function providerName(id) {
  return PROVIDER_NAMES[/** @type {keyof typeof PROVIDER_NAMES} */ (id)] ?? id;
}
