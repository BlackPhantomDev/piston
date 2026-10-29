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

import { mockOnList } from './lists.js';

const MINUTE = 60_000;
const TRANSITION_MS = 2000; // how long "starting" / "stopping" take in the demo

/** @type {import('../api.js').Status['state']} */
let state = 'online';
let started = Date.now() - (3 * 60 + 12) * MINUTE;
let lastBackup = new Date().setHours(6, 0, 0, 0); // today 06:00
let installed = { provider: 'vanilla', version: '26.3' };

/** @param {number} minutes */
const ago = (minutes) => new Date(Date.now() - minutes * MINUTE).toISOString();

const SERVER_NAME = 'Survival-Welt';
const SERVER_ADDRESS = '192.168.178.42:25565';
const HOST = 'mc-server';

// Who is OP comes from the sample ops list (lists.js)
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
  const running = state === 'online';
  return {
    name: SERVER_NAME,
    address: SERVER_ADDRESS,
    host: HOST,
    state,
    provider: installed.provider,
    version: installed.version,
    startedAt: running ? new Date(started).toISOString() : null,
    players: {
      online: running ? players.length : 0,
      max: 20,
      list: running ? players.map((player) => ({ ...player, op: mockOnList('ops', player.name) })) : [],
    },
    tps: running ? 19.6 + Math.random() * 0.4 : null,
    memory: { usedMb: running ? 2560 + Math.round(Math.random() * 200) : 0, maxMb: 4096 },
    cpuPercent: running ? 30 + Math.random() * 10 : 0,
    lastBackupAt: new Date(lastBackup).toISOString(),
    java: [25],
    eulaAccepted: true,
  };
}

/** Names of everyone online right now, in list order (for mockCommand()). */
export function mockOnlineNames() {
  return state === 'online' ? players.map((player) => player.name) : [];
}

/**
 * Kick or ban: the player leaves the sample list.
 * @param {string} name  exactly as in the list
 */
export function mockRemovePlayer(name) {
  const index = players.findIndex((player) => player.name === name);
  if (index !== -1) players.splice(index, 1);
}

/** Pretends to archive the world; resolves when done. */
export async function mockCreateBackup() {
  await new Promise((resolve) => setTimeout(resolve, TRANSITION_MS));
  lastBackup = Date.now();
}

const STEPS = {
  start: ['starting', 'online'],
  stop: ['stopping', 'offline'],
  restart: ['stopping', 'starting', 'online'],
};

/**
 * Plays a start / stop / restart through its states; onChange runs after each step.
 * @param {'start' | 'stop' | 'restart'} action
 * @param {() => void} onChange
 */
export function mockServerAction(action, onChange) {
  STEPS[action].forEach((next, i) => {
    setTimeout(() => {
      state = /** @type {typeof state} */ (next);
      if (state === 'online') started = Date.now();
      onChange();
    }, i * TRANSITION_MS);
  });
}

const wait = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {typeof state} next
 * @param {() => void} onChange
 */
function setState(next, onChange) {
  state = next;
  if (state === 'online') started = Date.now();
  onChange();
}

/**
 * Plays the version switch of AGENTS.md §6.5 (Java check happens before, in the UI).
 * onStep gets each step as it starts; onChange runs on every server state change.
 * @param {{ provider: string, version: string }} target
 * @param {(step: 'stop' | 'backup' | 'download' | 'swap' | 'start') => void} onStep
 * @param {() => void} onChange
 */
export async function mockSwitchVersion(target, onStep, onChange) {
  onStep('stop');
  if (state !== 'offline') {
    setState('stopping', onChange);
    await wait(TRANSITION_MS);
    setState('offline', onChange);
  }
  onStep('backup');
  await wait(1200);
  lastBackup = Date.now();
  onStep('download');
  await wait(1500);
  onStep('swap');
  await wait(600);
  installed = { provider: target.provider, version: target.version };
  onStep('start');
  setState('starting', onChange);
  await wait(TRANSITION_MS);
  setState('online', onChange);
}

/**
 * Stop, backup, delete and regenerate the world, start again.
 * @param {() => void} onChange
 */
export async function mockResetWorld(onChange) {
  if (state !== 'offline') {
    setState('stopping', onChange);
    await wait(TRANSITION_MS);
    setState('offline', onChange);
  }
  await wait(1200);
  lastBackup = Date.now();
  setState('starting', onChange);
  await wait(TRANSITION_MS);
  setState('online', onChange);
}
