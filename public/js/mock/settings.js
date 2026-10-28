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

// Sample data for the settings page: server.properties values (GET /api/properties),
// panel settings and the providers' version lists. Only js/api.js imports this file.

/** A fresh vanilla server.properties – used by "Auf Standardwerte zurücksetzen". */
const DEFAULTS = {
  motd: 'A Minecraft Server',
  'max-players': 20,
  gamemode: 'survival',
  difficulty: 'easy',
  'level-name': 'world',
  'level-seed': '',
  'view-distance': 10,
  'simulation-distance': 10,
  'allow-nether': true,
  'generate-structures': true,
  'white-list': false,
  pvp: true,
  'online-mode': true,
  hardcore: false,
  'enable-command-block': false,
  'allow-flight': false,
  'spawn-protection': 16,
  'player-idle-timeout': 0,
  'server-port': 25565,
};

let properties = {
  ...DEFAULTS,
  motd: 'Willkommen auf [SERVER-NAME]!',
  difficulty: 'normal',
  'simulation-distance': 8,
};

/** Panel-side settings – not part of server.properties. */
let panel = { memoryMb: 4096, autoRestart: '05:00' };

const RELEASES = ['26.3', '26.2', '26.1', '1.21.11', '1.21.10', '1.21.8', '1.21.4', '1.20.6'];
const SNAPSHOTS = ['26.4-snapshot-2', '26.4-snapshot-1'];

/** @type {Record<string, { releases: string[], snapshots: string[] }>} */
const PROVIDERS = {
  vanilla: { releases: RELEASES, snapshots: SNAPSHOTS },
  paper: { releases: RELEASES.slice(0, 6), snapshots: [] },
  fabric: { releases: RELEASES, snapshots: SNAPSHOTS.slice(0, 1) },
};

const wait = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockGetSettings() {
  await wait(200);
  return structuredClone({ properties, panel });
}

export async function mockDefaultProperties() {
  return structuredClone(DEFAULTS);
}

/**
 * Merges like the real server will: keys the page does not show stay untouched.
 * @param {{ properties: Partial<typeof properties>, panel: Partial<typeof panel> }} next
 */
export async function mockSaveSettings(next) {
  await wait(400);
  properties = { ...properties, ...structuredClone(next.properties) };
  panel = { ...panel, ...structuredClone(next.panel) };
}

/**
 * @param {string} provider
 * @param {boolean} snapshots
 * @returns {Promise<import('../api.js').McVersion[]>}
 */
export async function mockVersions(provider, snapshots) {
  await wait(150);
  const lists = PROVIDERS[provider] ?? { releases: [], snapshots: [] };
  return [
    ...(snapshots ? lists.snapshots.map((id) => ({ id, stable: false })) : []),
    ...lists.releases.map((id) => ({ id, stable: true })),
  ];
}
