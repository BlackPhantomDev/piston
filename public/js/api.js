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

// The pages' only way to server data (AGENTS.md §12). This file is the contract –
// the types below – and picks where the data comes from:
//   api/demo.js – sample data from js/mock/, no backend needed;
//                 ?sim=lost shows what happens when the connection breaks
//   api/live.js – the PiSton backend over fetch + WebSocket (comes with phase 7)
// Pages never import those files directly. scripts/build_dist.py always builds
// the demo, whatever the line below says.

export * from './api/demo.js';

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
 * @property {string} host  hostname of the machine running PiSton – reachable as http://<host>.local
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
 * @typedef {object} ListEntry  one player in whitelist.json, ops.json or banned-players.json
 * @property {string} name
 * @property {number} [level]  ops only: permission level 1–4
 * @property {string} [reason]  bans only
 * @property {string} [created]  bans only: ISO date
 */

/** @typedef {{ whitelist: ListEntry[], ops: ListEntry[], bans: ListEntry[] }} Lists */

/**
 * @typedef {object} LogLine  one parsed line of latest.log (AGENTS.md §6.1)
 * @property {string} time  "HH:MM:SS"
 * @property {string} level  'INFO' | 'WARN' | 'ERROR' | …
 * @property {string} text
 */

/**
 * @typedef {object} Connection
 * @property {'online' | 'lost'} state
 * @property {number} attempt  number of the next or running reconnect attempt (0 while online)
 * @property {boolean} trying  an attempt is running right now
 * @property {number | null} nextAttemptAt  time (ms) of the next automatic attempt
 * @property {number} retryDelayMs  wait before that attempt, for the progress bar
 * @property {boolean} manualAttemptFailed  "Jetzt erneut versuchen" was pressed and failed
 * @property {number | null} lastConnectedAt  time (ms) the connection was last known to work
 */
