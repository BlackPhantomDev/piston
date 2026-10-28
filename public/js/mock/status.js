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

// Sample data in the format of GET /api/status, used until the backend exists.
// Pages never import this file – only js/api.js does. Removed before release.

const MINUTE = 60_000;
const started = Date.now() - (3 * 60 + 12) * MINUTE;

/** @param {number} minutes */
const ago = (minutes) => new Date(Date.now() - minutes * MINUTE).toISOString();

const players = [
  { name: 'Steve', dimension: 'overworld', joinedAt: ago(47), pingMs: 23 },
  { name: 'Alex', dimension: 'overworld', joinedAt: ago(65), pingMs: 41 },
  { name: 'Mia_Baut', dimension: 'nether', joinedAt: ago(12), pingMs: 88 },
  { name: 'Builder_Max', dimension: 'overworld', joinedAt: ago(150), pingMs: 19 },
  { name: 'Creeperfan', dimension: 'end', joinedAt: ago(8), pingMs: 57 },
  { name: 'Lena_MC', dimension: 'overworld', joinedAt: ago(33), pingMs: 30 },
];

/**
 * A fresh status object; TPS and RAM wobble a little so live updates are visible.
 * @returns {import('../api.js').Status}
 */
export function mockStatus() {
  return {
    state: 'online',
    provider: 'vanilla',
    version: '26.3',
    startedAt: new Date(started).toISOString(),
    players: { online: players.length, max: 20, list: structuredClone(players) },
    tps: 19.6 + Math.random() * 0.4,
    memory: { usedMb: 2560 + Math.round(Math.random() * 200), maxMb: 4096 },
    cpuPercent: 30 + Math.random() * 10,
  };
}
