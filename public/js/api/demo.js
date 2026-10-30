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

// Demo implementation of api.js: everything runs in the browser on the sample data
// in js/mock/ – no backend, no Minecraft server. Same functions, same data shapes
// as the live version will have, so pages cannot tell the difference.
// ?sim=error makes the "backend" answer with errors (mock/errors.js),
// ?sim=eula starts without an accepted EULA (mock/status.js).
// Stays in the repo for good: scripts/build_dist.py builds the demo from it.

import { mockConnect, mockWatchConnection } from '../mock/connection.js';
import { mockFail, mockRule } from '../mock/errors.js';
import { mockChangeList, mockLists } from '../mock/lists.js';
import { mockCommand, mockLogBacklog, mockLogLine } from '../mock/log.js';
import { mockDefaultProperties, mockGetSettings, mockSaveSettings, mockVersions } from '../mock/settings.js';
import {
  mockAcceptEula,
  mockCreateBackup,
  mockResetWorld,
  mockServerAction,
  mockStatus,
  mockSwitchVersion,
} from '../mock/status.js';

/** @typedef {import('../api.js').Connection} Connection */
/** @typedef {import('../api.js').Lists} Lists */
/** @typedef {import('../api.js').LogLine} LogLine */
/** @typedef {import('../api.js').McVersion} McVersion */
/** @typedef {import('../api.js').Settings} Settings */
/** @typedef {import('../api.js').Status} Status */

const STATUS_INTERVAL_MS = 5000; // AGENTS.md §6.4: polling ≥ 5 s
const MOCK_LOG_INTERVAL_MS = 4000; // sample data only – the real log is pushed via WebSocket
const MOCK_LOG_DELAY_MS = 150; // sample data only – delay of command lines in the log
const MOCK_LATENCY_MS = 300; // sample data only – first data arrives like over the network

/** @type {Set<(status: Status) => void>} */
const statusListeners = new Set();

/** @type {Set<(lines: LogLine[]) => void>} */
const logListeners = new Set();

/** Log listeners that subscribed while the connection was lost and still wait for the buffer. */
const logListenersWithoutBacklog = new Set();

// ---------- Connection to the panel (the live version: the WebSocket) ----------

// The wait grows with every failed attempt, then stays at 30 s
const RETRY_DELAYS_MS = [5000, 10000, 20000, 30000];

/** @type {Connection} */
let connection = {
  state: 'online',
  attempt: 0,
  trying: false,
  nextAttemptAt: null,
  retryDelayMs: 0,
  manualAttemptFailed: false,
  lastConnectedAt: Date.now(),
};

/** @type {Set<(connection: Connection) => void>} */
const connectionListeners = new Set();
let retryTimer = 0;

/**
 * Calls back right away with the connection state and again on every change.
 * @param {(connection: Connection) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onConnection(callback) {
  connectionListeners.add(callback);
  callback({ ...connection });
  return () => connectionListeners.delete(callback);
}

/** "Jetzt erneut versuchen": try at once instead of waiting for the countdown. */
export function reconnectNow() {
  if (connection.state === 'lost' && !connection.trying) attemptReconnect(true);
}

/** @param {Partial<Connection>} changes */
function setConnection(changes) {
  connection = { ...connection, ...changes };
  for (const listener of connectionListeners) listener({ ...connection });
}

function connectionLost() {
  if (connection.state === 'lost') return;
  scheduleReconnect({ state: 'lost', attempt: 1, trying: false, manualAttemptFailed: false });
}

/**
 * Sets the next automatic attempt – together with the other changes in one update,
 * so listeners never see a state without its countdown.
 * @param {Partial<Connection>} changes
 */
function scheduleReconnect(changes) {
  clearTimeout(retryTimer);
  const attempt = changes.attempt ?? connection.attempt;
  const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length) - 1];
  setConnection({ ...changes, nextAttemptAt: Date.now() + delay, retryDelayMs: delay });
  retryTimer = setTimeout(() => attemptReconnect(false), delay);
}

/** @param {boolean} manual */
async function attemptReconnect(manual) {
  clearTimeout(retryTimer);
  setConnection({ trying: true, nextAttemptAt: null, manualAttemptFailed: false });
  if (await mockConnect()) {
    setConnection({ state: 'online', attempt: 0, trying: false, lastConnectedAt: Date.now() });
    // What the backend sends to a client that (re)connects: status and log buffer
    broadcastStatus();
    for (const listener of logListenersWithoutBacklog) listener(mockLogBacklog());
    logListenersWithoutBacklog.clear();
  } else {
    scheduleReconnect({ trying: false, attempt: connection.attempt + 1, manualAttemptFailed: manual });
  }
}

mockWatchConnection(connectionLost);

// ---------- Live data ----------

/**
 * Calls back with the status as soon as it arrives (not synchronously – pages show
 * "Lädt …" until then) and again on every update. While the connection is lost,
 * nothing arrives – the next status comes with the reconnect.
 * Return the result from a page's render() so updates stop on navigation.
 * @param {(status: Status) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onStatus(callback) {
  statusListeners.add(callback);
  const first = setTimeout(() => {
    if (connection.state === 'online') callback(mockStatus());
  }, MOCK_LATENCY_MS);
  const timer = setInterval(() => {
    if (connection.state === 'online') callback(mockStatus());
  }, STATUS_INTERVAL_MS);
  return () => {
    clearTimeout(first);
    clearInterval(timer);
    statusListeners.delete(callback);
  };
}

/** Pushes the current status to every subscriber at once (e.g. after start/stop). */
function broadcastStatus() {
  if (connection.state !== 'online') return;
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
  await mockFail('serverAction');
  // Like the backend: no start before the EULA is accepted (AGENTS.md §6.5)
  if (action === 'start' && !mockStatus().eulaAccepted) throw mockRule('eulaMissing');
  mockServerAction(action, broadcastStatus);
}

/**
 * Accepts the Minecraft EULA: writes eula=true to eula.txt (later POST /api/eula
 * { accept: true }, a draft in AGENTS.md §9). Call it only from the user's explicit
 * confirmation – ticked checkbox + button – never on your own (AGENTS.md §6.5).
 * The new eulaAccepted arrives through onStatus().
 * @returns {Promise<void>}
 */
export async function acceptEula() {
  await mockFail('eula');
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  mockAcceptEula();
  broadcastStatus();
}

/**
 * Calls back with the buffered lines as soon as they arrive, then with each new line.
 * Lines are always oldest first – pass them straight to <log-view>.add().
 * @param {(lines: LogLine[]) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onLog(callback) {
  logListeners.add(callback);
  // While the connection is lost, the buffer follows with the reconnect
  const first = setTimeout(() => {
    if (connection.state === 'online') callback(mockLogBacklog());
    else logListenersWithoutBacklog.add(callback);
  }, MOCK_LATENCY_MS);
  const timer = setInterval(() => {
    if (connection.state === 'online') callback([mockLogLine()]);
  }, MOCK_LOG_INTERVAL_MS);
  return () => {
    clearTimeout(first);
    clearInterval(timer);
    logListeners.delete(callback);
    logListenersWithoutBacklog.delete(callback);
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
  await mockFail('command');
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
  await mockFail('backup');
  await mockCreateBackup();
  broadcastStatus();
}

/**
 * Current settings (later GET /api/properties; the panel part from GET /api/panel,
 * a draft in AGENTS.md §9). RCON values are never included.
 * @returns {Promise<Settings>}
 */
export async function getSettings() {
  await mockFail('settings');
  return mockGetSettings();
}

/**
 * Values of a fresh server.properties, for "Auf Standardwerte zurücksetzen"
 * (later GET /api/properties/defaults, a draft in AGENTS.md §9).
 * @returns {Promise<Settings['properties']>}
 */
export async function getDefaultProperties() {
  await mockFail('defaults');
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
  await mockFail('saveSettings');
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
  await mockFail('versions');
  return mockVersions(provider, snapshots);
}

/**
 * Runs the version switch (later POST /api/versions/switch, progress via WebSocket).
 * @param {{ provider: string, version: string, confirmDowngrade?: boolean }} target
 * @param {(step: 'stop' | 'backup' | 'download' | 'swap' | 'start') => void} onStep  called as each step starts
 * @returns {Promise<void>} resolves when the server is up again – also after a failed
 *   switch (rejects then), which brings the old version back up first
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
  await mockFail('resetWorld');
  await mockResetWorld(broadcastStatus);
}

/**
 * Whitelist, operators and banned players (later GET /api/lists, a draft in AGENTS.md §9).
 * @returns {Promise<Lists>}
 */
export async function getLists() {
  await mockFail('lists');
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  return mockLists();
}

/** The RCON command for each list change – what the backend sends while the server runs. */
const LIST_COMMANDS = {
  whitelist: { add: (name) => `whitelist add ${name}`, remove: (name) => `whitelist remove ${name}` },
  ops: { add: (name) => `op ${name}`, remove: (name) => `deop ${name}` },
  bans: { add: (name, reason) => (reason ? `ban ${name} ${reason}` : `ban ${name}`), remove: (name) => `pardon ${name}` },
};

/**
 * Puts a player on a list or takes them off (later POST /api/lists/<list>, a draft in AGENTS.md §9).
 * Like the backend will (AGENTS.md §6.3): RCON while the server runs, the file only while it is stopped.
 * Changes apply at once – no save, no restart.
 * @param {keyof Lists} list
 * @param {'add' | 'remove'} action
 * @param {string} name
 * @param {{ reason?: string }} [options]  bans only
 * @returns {Promise<void>}
 */
export async function changeList(list, action, name, { reason = '' } = {}) {
  await mockFail(action === 'add' ? 'listAdd' : 'listRemove');
  if (mockStatus().state === 'online') {
    await sendCommand(LIST_COMMANDS[list][action](name, reason));
  } else {
    mockChangeList(list, action, name, reason);
  }
}
