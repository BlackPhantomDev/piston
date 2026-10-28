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

// The pages' only way to server data. Serves sample data from js/mock/
// for now; later fetch + WebSocket (AGENTS.md §9) – pages stay unchanged.

import { mockCommand, mockLogBacklog, mockLogLine } from './mock/log.js';
import { mockCreateBackup, mockServerAction, mockStatus } from './mock/status.js';

/**
 * @typedef {object} Player
 * @property {string} name
 * @property {'overworld' | 'nether' | 'end'} dimension
 * @property {string} joinedAt  ISO date
 * @property {number} pingMs
 */

/**
 * @typedef {object} Status  shape of GET /api/status
 * @property {'online' | 'offline' | 'starting' | 'stopping'} state
 * @property {string} provider  'vanilla' | 'paper' | 'fabric'
 * @property {string} version
 * @property {string | null} startedAt  ISO date, null while offline
 * @property {{ online: number, max: number, list: Player[] }} players
 * @property {number | null} tps  null if unknown
 * @property {{ usedMb: number, maxMb: number }} memory
 * @property {number} cpuPercent
 * @property {string | null} lastBackupAt  ISO date, null if there is none
 */

/**
 * @typedef {object} LogLine  one parsed line of latest.log (AGENTS.md §6.1)
 * @property {string} time  "HH:MM:SS"
 * @property {string} level  'INFO' | 'WARN' | 'ERROR' | …
 * @property {string} text
 */

const STATUS_INTERVAL_MS = 5000; // AGENTS.md §6.4: polling ≥ 5 s
const MOCK_LOG_INTERVAL_MS = 4000; // sample data only – the real log is pushed via WebSocket

/** @type {Set<(status: Status) => void>} */
const statusListeners = new Set();

/** @type {Set<(lines: LogLine[]) => void>} */
const logListeners = new Set();

/**
 * Calls back right away with the current status and again on every update.
 * Return the result from a page's render() so updates stop on navigation.
 * @param {(status: Status) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onStatus(callback) {
  statusListeners.add(callback);
  callback(mockStatus());
  const timer = setInterval(() => callback(mockStatus()), STATUS_INTERVAL_MS);
  return () => {
    clearInterval(timer);
    statusListeners.delete(callback);
  };
}

/** Pushes the current status to every subscriber at once (e.g. after start/stop). */
function broadcastStatus() {
  const status = mockStatus();
  for (const listener of statusListeners) listener(status);
}

/**
 * Starts, stops or restarts the Minecraft server (later POST /api/server/<action>).
 * Progress arrives through onStatus(): "stopping" → "offline" etc.
 * @param {'start' | 'stop' | 'restart'} action
 * @returns {Promise<void>}
 */
export async function serverAction(action) {
  mockServerAction(action, broadcastStatus);
}

/**
 * Calls back right away with the buffered lines, then with each new line.
 * Lines are always oldest first – pass them straight to <log-view>.add().
 * @param {(lines: LogLine[]) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onLog(callback) {
  logListeners.add(callback);
  callback(mockLogBacklog());
  const timer = setInterval(() => callback([mockLogLine()]), MOCK_LOG_INTERVAL_MS);
  return () => {
    clearInterval(timer);
    logListeners.delete(callback);
  };
}

/**
 * Sends a console command via RCON (later WebSocket { type: 'cmd', command }).
 * The server's answer shows up in the log for everyone.
 * @param {string} command  without leading slash, e.g. "save-all"
 * @returns {Promise<void>}
 */
export async function sendCommand(command) {
  const lines = mockCommand(command);
  for (const listener of logListeners) listener(lines);
}

/**
 * Creates a world backup (later POST /api/backups). Resolves when it is done;
 * the new lastBackupAt arrives through onStatus().
 * @returns {Promise<void>}
 */
export async function createBackup() {
  await mockCreateBackup();
  broadcastStatus();
}
