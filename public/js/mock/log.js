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
 * What the server would write to the log for a console command.
 * @param {string} command  e.g. "save-all", "say Hallo"
 * @returns {import('../api.js').LogLine[]}
 */
export function mockCommand(command) {
  const [name, ...args] = command.split(' ');
  /** @type {Record<string, string[]>} */
  const responses = {
    'save-all': ['Saving the game (this may take a moment!)', 'Saved the game'],
    time: ['Set the time to 1000'],
    say: [`[Server] ${args.join(' ')}`],
  };
  const texts = responses[name] ?? [`Unknown or incomplete command: ${command}`];
  return texts.map((text) => ({ time: now(), level: 'INFO', text }));
}

function now() {
  return new Date().toTimeString().slice(0, 8);
}
