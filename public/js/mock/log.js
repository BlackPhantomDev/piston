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

// Sample log lines in the parsed format { time, level, text } (AGENTS.md §6.1),
// used until the backend streams latest.log. Only js/api.js imports this file.

import { mockOnlineNames, mockRemovePlayer, mockSetOp } from './status.js';

/** @type {import('../api.js').LogLine[]} */
const BACKLOG = [
  { time: '12:04:11', level: 'INFO', text: 'Starting minecraft server version 26.3' },
  { time: '12:04:11', level: 'INFO', text: 'Loading properties' },
  { time: '12:04:12', level: 'INFO', text: 'Default game type: SURVIVAL' },
  { time: '12:04:13', level: 'INFO', text: 'Preparing level "world"' },
  { time: '12:04:17', level: 'INFO', text: 'Done (3.214s)! For help, type "help"' },
  { time: '14:58:02', level: 'INFO', text: 'Steve joined the game' },
  { time: '15:02:41', level: 'INFO', text: 'Alex has made the advancement [Stone Age]' },
  { time: '15:05:13', level: 'INFO', text: 'Saving the game (this may take a moment!)' },
  { time: '15:05:14', level: 'INFO', text: 'Saved the game' },
  { time: '15:07:30', level: 'WARN', text: "Can't keep up! Is the server overloaded? Running 2140ms behind" },
  { time: '15:08:02', level: 'ERROR', text: 'Failed to save chunk [12, -4]' },
  { time: '15:09:56', level: 'INFO', text: 'Mia_Baut left the game' },
  { time: '15:11:20', level: 'INFO', text: '<Alex> hat jemand Eisen übrig?' },
];

// New lines are picked from here in turn
const UPCOMING = [
  { level: 'INFO', text: '<Steve> hab noch 12 Eisen, komm vorbei' },
  { level: 'INFO', text: 'Creeperfan joined the game' },
  { level: 'INFO', text: 'Builder_Max has made the advancement [Hot Stuff]' },
  { level: 'WARN', text: "Can't keep up! Is the server overloaded? Running 2052ms behind" },
  { level: 'INFO', text: '<Lena_MC> gg' },
  { level: 'INFO', text: 'Creeperfan left the game' },
];

let next = 0;

/** All lines the server has written so far (what a new client gets first). */
export function mockLogBacklog() {
  return structuredClone(BACKLOG);
}

/** The next "new" line, stamped with the current time. */
export function mockLogLine() {
  const line = UPCOMING[next % UPCOMING.length];
  next += 1;
  return { time: now(), ...line };
}

/**
 * @typedef {object} CommandResult
 * @property {string[]} response  back to the sender only
 * @property {import('../api.js').LogLine[]} log  lands in latest.log for everyone
 * @property {boolean} statusChanged  the player list changed (kick, ban, op, deop)
 */

const PLAYER_COMMANDS = ['kick', 'ban', 'op', 'deop', 'tell', 'msg', 'w'];

/**
 * How the server reacts to an RCON command, like vanilla does
 * (command feedback logged as "[Rcon: …]", say as "[Rcon] …").
 * @param {string} command  e.g. "save-all", "say Hallo"
 * @returns {CommandResult}
 */
export function mockCommand(command) {
  const [name, ...args] = command.split(' ');
  const arg = args.join(' ');
  const online = mockOnlineNames();
  /** @type {Record<string, () => string[]>} */
  const feedback = {
    list: () => [`There are ${online.length} of a max of 20 players online: ${online.join(', ')}`],
    'save-all': () => ['Saving the game (this may take a moment!)', 'Saved the game'],
    time: () => (args[0] === 'set' && args[1] ? [`Set the time to ${args[1] === 'day' ? 1000 : args[1]}`] : []),
    weather: () => (args[0] ? [`Set the weather to ${args[0]}`] : []),
    whitelist: () => (args[0] === 'add' && args[1] ? [`Added ${args[1]} to the whitelist`] : []),
  };

  if (name === 'say') {
    return arg ? result([], [`[Rcon] ${arg}`]) : result([usage(command)]);
  }
  if (PLAYER_COMMANDS.includes(name)) return playerCommand(command, name, args, online);

  const response = feedback[name]?.() ?? [];
  if (response.length === 0) return result([usage(command)]);
  return result(response, name === 'list' ? [] : response.map((text) => `[Rcon: ${text}]`));
}

/**
 * Commands aimed at one player who has to be online.
 * @param {string} command
 * @param {string} name
 * @param {string[]} args
 * @param {string[]} online
 * @returns {CommandResult}
 */
function playerCommand(command, name, args, online) {
  const [target = '', ...words] = args;
  if (!target) return result([usage(command)]);
  const player = online.find((candidate) => candidate.toLowerCase() === target.toLowerCase());
  if (!player) return result(['No player was found']);

  switch (name) {
    case 'kick':
    case 'ban': {
      mockRemovePlayer(player);
      const feedback = name === 'kick' ? `Kicked ${player}: Kicked by an operator` : `Banned ${player}: Banned by an operator.`;
      const reason = name === 'kick' ? 'Kicked by an operator' : 'You are banned from this server.';
      return result([feedback], [`[Rcon: ${feedback}]`, `${player} lost connection: ${reason}`, `${player} left the game`], true);
    }
    case 'op':
    case 'deop': {
      const op = name === 'op';
      if (!mockSetOp(player, op)) {
        return result([op ? 'Nothing changed. The player already is an operator' : 'Nothing changed. The player is not an operator']);
      }
      const feedback = op ? `Made ${player} a server operator` : `Made ${player} no longer a server operator`;
      return result([feedback], [`[Rcon: ${feedback}]`], true);
    }
    default: {
      // tell, msg, w – only the two of them see it
      const message = words.join(' ');
      return message ? result([`You whisper to ${player}: ${message}`]) : result([usage(command)]);
    }
  }
}

/**
 * @param {string[]} response
 * @param {string[]} [logged]  texts for latest.log
 * @param {boolean} [statusChanged]
 * @returns {CommandResult}
 */
function result(response, logged = [], statusChanged = false) {
  return { response, log: logged.map(line), statusChanged };
}

/** @param {string} command */
function usage(command) {
  return `Unknown or incomplete command, see below for error: ${command}<--[HERE]`;
}

/** @param {string} text */
function line(text) {
  return { time: now(), level: 'INFO', text };
}

function now() {
  return new Date().toTimeString().slice(0, 8);
}
