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

// What the backend answers when something goes wrong – { error: { code, message } },
// AGENTS.md §9 – for the demo with ?sim=error (see sim.js):
//   every change fails (start/stop, commands, backup, saving, lists, version, world),
//   every read fails the first time and works on "Erneut versuchen".
// The messages are the backend's: German, without paths or system details (AGENTS.md §8).
// Without the parameter nothing fails. Only js/api/demo.js and mock files import this file.

import { ApiError } from '../api/error.js';
import { simulates } from './sim.js';

const SIM_ERROR = simulates('error');
const LATENCY_MS = 300; // the error comes back like an answer over the network

/** @type {Record<string, [code: string, message: string]>} */
const ERRORS = {
  // Changes – fail every time
  serverAction: ['service_failed', 'Der Minecraft-Dienst hat nicht reagiert. Was schiefging, steht meist in den letzten Zeilen der Konsole.'],
  command: ['rcon_unavailable', 'Keine Verbindung zur Server-Konsole (RCON). Der Befehl wurde nicht gesendet.'],
  backup: ['disk_full', 'Auf dem Speicher ist nicht genug Platz frei. Lösche alte Backups und versuch es noch einmal.'],
  saveSettings: ['write_failed', 'Die Datei server.properties ließ sich nicht schreiben. Es wurde nichts geändert.'],
  listAdd: ['player_unknown', 'Mojang kennt keinen Spieler mit diesem Namen. Prüfe die Schreibweise.'],
  listRemove: ['rcon_unavailable', 'Keine Verbindung zur Server-Konsole (RCON). Die Liste wurde nicht geändert.'],
  switchVersion: ['checksum_mismatch', 'Die heruntergeladene Datei ist beschädigt (Prüfsumme passt nicht). Die bisherige Version läuft weiter.'],
  resetWorld: ['disk_full', 'Für das Backup vorher ist nicht genug Platz frei. Die Welt ist unverändert.'],
  // Reads – fail only the first time
  settings: ['read_failed', 'Die Datei server.properties ließ sich nicht lesen.'],
  defaults: ['read_failed', 'Die Standardwerte ließen sich nicht laden.'],
  lists: ['read_failed', 'Die Spielerlisten ließen sich nicht lesen.'],
  versions: ['provider_unreachable', 'Der Anbieter antwortet gerade nicht. Versuch es gleich noch einmal.'],
};
const READS = new Set(['settings', 'defaults', 'lists', 'versions']);

/** Reads that already failed once */
const failedReads = new Set();

const wait = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The error the backend would send for `what` – null if it goes through.
 * @param {keyof typeof ERRORS} what
 * @returns {ApiError | null}
 */
export function mockError(what) {
  if (!SIM_ERROR) return null;
  if (READS.has(what)) {
    if (failedReads.has(what)) return null;
    failedReads.add(what);
  }
  const [code, message] = ERRORS[what];
  return new ApiError(code, message);
}

/**
 * A request the backend turns down: waits like one, then throws mockError(what).
 * Returns at once if nothing fails.
 * @param {keyof typeof ERRORS} what
 */
export async function mockFail(what) {
  const error = mockError(what);
  if (!error) return;
  await wait(LATENCY_MS);
  throw error;
}
