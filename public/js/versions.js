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

// Minecraft version numbers (AGENTS.md §6.5). Two schemes:
//   old, up to 1.21.11:  1.MINOR.PATCH          e.g. 1.20.6, 1.21.11
//   new, from 2026:      YY.DROP or YY.DROP.HOTFIX  e.g. 26.1, 26.3.1
// Reading both as three numbers sorts them correctly, because 26 > 1.
// Pre-releases carry a suffix ("26.4-snapshot-1") and sort below their release.

const PATTERN = /^(\d+)\.(\d+)(?:\.(\d+))?(?:-(.+))?$/;

/**
 * @param {string} version
 * @returns {{ parts: [number, number, number], suffix: string } | null}
 */
function parse(version) {
  const match = PATTERN.exec(version);
  if (!match) return null;
  return {
    parts: [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)],
    suffix: match[4] ?? '',
  };
}

/**
 * Sort order of two versions: negative if a is older, positive if newer, 0 if equal.
 * Unknown formats sort below everything known.
 * @param {string} a
 * @param {string} b
 */
export function compareVersions(a, b) {
  const pa = parse(a);
  const pb = parse(b);
  if (!pa || !pb) return (pa ? 1 : 0) - (pb ? 1 : 0);
  for (let i = 0; i < 3; i++) {
    if (pa.parts[i] !== pb.parts[i]) return pa.parts[i] - pb.parts[i];
  }
  if (pa.suffix === pb.suffix) return 0;
  if (!pa.suffix) return 1; // release beats its pre-releases
  if (!pb.suffix) return -1;
  return pa.suffix.localeCompare(pb.suffix, 'en', { numeric: true });
}

/**
 * Java needed for a server version: 26.x → 25, 1.20.5 – 1.21.11 → 21.
 * @param {string} version
 * @returns {number | null} null if unknown / not supported
 */
export function requiredJava(version) {
  const parsed = parse(version);
  if (!parsed) return null;
  const [major, minor, patch] = parsed.parts;
  if (major >= 26) return 25;
  if (major === 1 && (minor === 21 || (minor === 20 && patch >= 5))) return 21;
  return null;
}
