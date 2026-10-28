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
import { mockDefaultProperties, mockGetSettings, mockSaveSettings, mockVersions } from './mock/settings.js';
import { mockCreateBackup, mockResetWorld, mockServerAction, mockStatus, mockSwitchVersion } from './mock/status.js';

/**
 * @typedef {object} Player
 * @property {string} name
 * @property {'overworld' | 'nether' | 'end'} dimension
 * @property {string} joinedAt  ISO date
 * @property {number} pingMs
 * @property {boolean} op  on the operator list (ops.json)
 */

/**
 * @typedef {object} Status  shape of GET /api/status
 * @property {string} name  server name for the sidebar (source still open, AGENTS.md §9)
 * @property {string} address  "host:port" players connect to
 * @property {'online' | 'offline' | 'starting' | 'stopping'} state
 * @property {string} provider  'vanilla' | 'paper' | 'fabric'
 * @property {string} version
 * @property {string | null} startedAt  ISO date, null while offline
 * @property {{ online: number, max: number, list: Player[] }} players
 * @property {number | null} tps  null if unknown
 * @property {{ usedMb: number, maxMb: number }} memory
 * @property {number} cpuPercent
 * @property {string | null} lastBackupAt  ISO date, null if there is none
 * @property {number[]} java  installed Java major versions, e.g. [25, 21]
 * @property {boolean} eulaAccepted  eula.txt says eula=true
 */

/** @typedef {{ id: string, stable: boolean }} McVersion  AGENTS.md §6.5 */

/**
 * @typedef {object} Settings
 * @property {Record<string, string | number | boolean>} properties  server.properties, keyed like the file
 * @property {{ memoryMb: number, autoRestart: string }} panel  panel-side settings; autoRestart "HH:MM" or "off"
 */

/**
 * @typedef {object} LogLine  one parsed line of latest.log (AGENTS.md §6.1)
 * @property {string} time  "HH:MM:SS"
 * @property {string} level  'INFO' | 'WARN' | 'ERROR' | …
 * @property {string} text
 */

const STATUS_INTERVAL_MS = 5000; // AGENTS.md §6.4: polling ≥ 5 s
const MOCK_LOG_INTERVAL_MS = 4000; // sample data only – the real log is pushed via WebSocket
const MOCK_LOG_DELAY_MS = 150; // sample data only – delay of command lines in the log

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
 * Resolves with the server's answer for the sender (later message 'cmd-result');
 * whatever the server writes to latest.log arrives for everyone through onLog().
 * @param {string} command  without leading slash, e.g. "save-all"
 * @returns {Promise<string[]>} response lines, may be empty (e.g. for say)
 */
export async function sendCommand(command) {
  const { response, log, statusChanged } = mockCommand(command);
  // kick, ban, op, … change the player list – the backend's next status shows it
  if (statusChanged) broadcastStatus();
  if (log.length > 0) {
    // latest.log is tailed, so its lines arrive a moment after the direct answer
    setTimeout(() => {
      for (const listener of logListeners) listener(log);
    }, MOCK_LOG_DELAY_MS);
  }
  return response;
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

/**
 * Current settings (later GET /api/properties; the panel part from GET /api/panel,
 * a draft in AGENTS.md §9). RCON values are never included.
 * @returns {Promise<Settings>}
 */
export async function getSettings() {
  return mockGetSettings();
}

/**
 * Values of a fresh server.properties, for "Auf Standardwerte zurücksetzen"
 * (later GET /api/properties/defaults, a draft in AGENTS.md §9).
 * @returns {Promise<Settings['properties']>}
 */
export async function getDefaultProperties() {
  return mockDefaultProperties();
}

/**
 * Saves settings (later PUT /api/properties, validated on the server).
 * They take effect after a restart – pass restart: true to do it right away.
 * @param {Settings} settings
 * @param {{ restart?: boolean }} [options]
 * @returns {Promise<void>}
 */
export async function saveSettings(settings, { restart = false } = {}) {
  await mockSaveSettings(settings);
  if (restart) await serverAction('restart');
}

/**
 * Versions a provider offers, newest first (later GET /api/versions?provider=…).
 * @param {string} provider  'vanilla' | 'paper' | 'fabric'
 * @param {{ snapshots?: boolean }} [options]
 * @returns {Promise<McVersion[]>}
 */
export async function getVersions(provider, { snapshots = false } = {}) {
  return mockVersions(provider, snapshots);
}

/**
 * Runs the version switch (later POST /api/versions/switch, progress via WebSocket).
 * @param {{ provider: string, version: string, confirmDowngrade?: boolean }} target
 * @param {(step: 'stop' | 'backup' | 'download' | 'swap' | 'start') => void} onStep  called as each step starts
 * @returns {Promise<void>} resolves when the server is up again
 */
export async function switchVersion(target, onStep) {
  await mockSwitchVersion(target, onStep, broadcastStatus);
  broadcastStatus();
}

/**
 * Deletes the world and lets the server generate it again – after a backup
 * (later POST /api/world/reset, a draft in AGENTS.md §9).
 * @returns {Promise<void>}
 */
export async function resetWorld() {
  await mockResetWorld(broadcastStatus);
}
