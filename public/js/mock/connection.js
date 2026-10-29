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

// Simulated connection to the panel, for the demo and the tests.
// Open the panel with sim=lost – before the # (index.html?sim=lost#/home) or behind
// the route (#/home?sim=lost): the connection breaks after a few seconds, three
// reconnect attempts fail, the fourth gets through.
// Without the parameter the connection never breaks. Only js/api/demo.js imports this file.

const SIM_LOST = [location.search, location.hash.split('?')[1] ?? ''].some(
  (query) => new URLSearchParams(query).get('sim') === 'lost',
);
const LOST_AFTER_MS = 3000;
const FAILED_ATTEMPTS = 3;
const ATTEMPT_MS = 800; // how long one attempt takes

let failed = 0;

const wait = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calls onLost once when the simulated connection breaks.
 * @param {() => void} onLost
 */
export function mockWatchConnection(onLost) {
  if (SIM_LOST) setTimeout(onLost, LOST_AFTER_MS);
}

/**
 * One reconnect attempt (later: opening the WebSocket again).
 * @returns {Promise<boolean>} true once the panel answers again
 */
export async function mockConnect() {
  await wait(ATTEMPT_MS);
  if (!SIM_LOST) return true;
  failed += 1;
  return failed > FAILED_ATTEMPTS;
}
