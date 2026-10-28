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

import { mockChangeList, mockLists } from './lists.js';
import { mockOnlineNames, mockRemovePlayer } from './status.js';

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
 *   – whitelist and pardon do not touch anyone online
 */

const ONLINE_COMMANDS = ['kick', 'tell', 'msg', 'w']; // the player has to be online
const LIST_COMMANDS = ['op', 'deop', 'ban', 'pardon', 'whitelist']; // work for offline players too
const NAME = /^\w{3,16}$/;

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
  };

  if (name === 'say') {
    return arg ? result([], [`[Rcon] ${arg}`]) : result([usage(command)]);
  }
  if (ONLINE_COMMANDS.includes(name)) return onlineCommand(command, name, args, online);
  if (LIST_COMMANDS.includes(name)) return listCommand(command, name, args, online);

  const response = feedback[name]?.() ?? [];
  if (response.length === 0) return result([usage(command)]);
  return result(response, name === 'list' ? [] : response.map((text) => `[Rcon: ${text}]`));
}

/**
 * kick, tell, msg, w – aimed at a player who is online.
 * @param {string} command
 * @param {string} name
 * @param {string[]} args
 * @param {string[]} online
 * @returns {CommandResult}
 */
function onlineCommand(command, name, args, online) {
  const [target = '', ...words] = args;
  if (!target) return result([usage(command)]);
  const player = online.find((candidate) => candidate.toLowerCase() === target.toLowerCase());
  if (!player) return result(['No player was found']);

  if (name === 'kick') {
    mockRemovePlayer(player);
    const feedback = `Kicked ${player}: Kicked by an operator`;
    return result([feedback], [`[Rcon: ${feedback}]`, `${player} lost connection: Kicked by an operator`, `${player} left the game`], true);
  }
  // tell, msg, w – only the two of them see it
  const message = words.join(' ');
  return message ? result([`You whisper to ${player}: ${message}`]) : result([usage(command)]);
}

/**
 * op, deop, ban, pardon, whitelist add|remove|list – change the sample lists (lists.js).
 * @param {string} command
 * @param {string} name
 * @param {string[]} args
 * @param {string[]} online
 * @returns {CommandResult}
 */
function listCommand(command, name, args, online) {
  if (name === 'whitelist') {
    const [action, target = '', ...rest] = args;
    if (action === 'list' && !target) {
      const names = mockLists().whitelist.map((entry) => entry.name);
      return result([names.length ? `There are ${names.length} whitelisted player(s): ${names.join(', ')}` : 'There are no whitelisted players']);
    }
    if ((action !== 'add' && action !== 'remove') || !NAME.test(target) || rest.length) return result([usage(command)]);
    const add = action === 'add';
    if (!mockChangeList('whitelist', add ? 'add' : 'remove', target)) {
      return result([add ? 'Player is already whitelisted' : 'Player is not whitelisted']);
    }
    const feedback = add ? `Added ${target} to the whitelist` : `Removed ${target} from the whitelist`;
    return result([feedback], [`[Rcon: ${feedback}]`]);
  }

  const [target = '', ...words] = args;
  if (!NAME.test(target)) return result([usage(command)]);
  // Online players keep the spelling the server knows
  const player = online.find((candidate) => candidate.toLowerCase() === target.toLowerCase()) ?? target;

  switch (name) {
    case 'op':
    case 'deop': {
      const op = name === 'op';
      if (!mockChangeList('ops', op ? 'add' : 'remove', player)) {
        return result([op ? 'Nothing changed. The player already is an operator' : 'Nothing changed. The player is not an operator']);
      }
      const feedback = op ? `Made ${player} a server operator` : `Made ${player} no longer a server operator`;
      return result([feedback], [`[Rcon: ${feedback}]`], true);
    }
    case 'ban': {
      const reason = words.join(' ');
      if (!mockChangeList('bans', 'add', player, reason)) return result(['Nothing changed. The player is already banned']);
      const banned = mockLists().bans.find((entry) => entry.name === player);
      const feedback = `Banned ${player}: ${banned?.reason}`;
      const logged = [`[Rcon: ${feedback}]`];
      if (online.includes(player)) {
        mockRemovePlayer(player);
        logged.push(`${player} lost connection: You are banned from this server.`, `${player} left the game`);
      }
      return result([feedback], logged, true);
    }
    default: {
      // pardon
      if (!mockChangeList('bans', 'remove', player)) return result(["Nothing changed. The player isn't banned"]);
      const feedback = `Unbanned ${player}`;
      return result([feedback], [`[Rcon: ${feedback}]`]);
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
