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

// Which trouble the demo plays: the sim parameter of the address, before the #
// (index.html?sim=lost#/home) or behind the route (#/home?sim=lost).
// Several at once with a comma: ?sim=lost,error
//   lost  – the connection to the panel breaks (connection.js)
//   error – the backend answers with errors (errors.js)
//   eula  – eula.txt does not say eula=true yet, so the server cannot start (status.js)

/** @param {string} query  e.g. "sim=lost,error" */
const simsIn = (query) =>
  new URLSearchParams(query).getAll('sim').flatMap((value) => value.split(',')).filter(Boolean);

const SIM = new Set([location.search, location.hash.split('?')[1] ?? ''].flatMap(simsIn));

// The parameter is read once, when the page loads. Typing ?sim=… behind the # of an
// open panel only changes the hash – so reload, and the new trouble plays from the start.
// Links inside the panel drop the query; that keeps the running simulation as it is.
addEventListener('hashchange', () => {
  if (simsIn(location.hash.split('?')[1] ?? '').some((name) => !SIM.has(name))) location.reload();
});

/** @param {'lost' | 'error' | 'eula'} name */
export function simulates(name) {
  return SIM.has(name);
}
