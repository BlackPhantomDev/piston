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

// Sample whitelist.json, ops.json and banned-players.json (GET /api/lists, a draft).
// The single source for "who is OP" and "who is banned" in the demo: status.js
// and the console commands in log.js read and change these lists.

const DAY = 86_400_000;
const DEFAULT_BAN_REASON = 'Banned by an operator.';
const DEFAULT_OP_LEVEL = 4;

/** @type {import('../api.js').Lists} */
const lists = {
  whitelist: ['Steve', 'Alex', 'Mia_Baut', 'Builder_Max', 'Creeperfan', 'Lena_MC', 'Kolbenfreund'].map((name) => ({ name })),
  ops: [{ name: 'Steve', level: DEFAULT_OP_LEVEL }],
  bans: [
    { name: 'Griefer_123', reason: 'Hat das Rathaus angezündet', created: new Date(Date.now() - 3 * DAY).toISOString() },
    { name: 'xX_Spammer_Xx', reason: DEFAULT_BAN_REASON, created: new Date(Date.now() - 12 * DAY).toISOString() },
  ],
};

/** @param {string} a @param {string} b */
const sameName = (a, b) => a.toLowerCase() === b.toLowerCase();

export function mockLists() {
  return structuredClone(lists);
}

/** @param {keyof typeof lists} list @param {string} name */
export function mockOnList(list, name) {
  return lists[list].some((entry) => sameName(entry.name, name));
}

/**
 * Adds or removes a player like the server does (case-insensitive names).
 * @param {keyof typeof lists} list
 * @param {'add' | 'remove'} action
 * @param {string} name
 * @param {string} [reason]  bans only; empty means the server's default text
 * @returns {boolean} false if nothing changed
 */
export function mockChangeList(list, action, name, reason = '') {
  const index = lists[list].findIndex((entry) => sameName(entry.name, name));
  if (action === 'remove') {
    if (index === -1) return false;
    lists[list].splice(index, 1);
    return true;
  }
  if (index !== -1) return false;
  /** @type {import('../api.js').ListEntry} */
  const entry = { name };
  if (list === 'ops') entry.level = DEFAULT_OP_LEVEL;
  if (list === 'bans') {
    entry.reason = reason || DEFAULT_BAN_REASON;
    entry.created = new Date().toISOString();
  }
  lists[list].push(entry);
  return true;
}
