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

// A tiny test runner for the browser – no framework, no Node.
//   group('piston-toggle', () => { test('…', async ({ mount }) => { … }); });
// Tests run one after the other. Each gets a fresh fixture element in the page.
// When all are done, window.testResults holds the outcome and <html data-status="done">
// is set – for a later runner that opens this page headless (AGENTS.md §10).

/**
 * @typedef {object} Context
 * @property {(html: string) => HTMLElement} mount  puts constant test markup into the fixture
 * @property {HTMLElement} fixture
 */

/** @type {{ group: string, name: string, fn: (ctx: Context) => unknown }[]} */
const tests = [];
let currentGroup = '';

/** @param {string} name @param {() => void} define */
export function group(name, define) {
  currentGroup = name;
  define();
  currentGroup = '';
}

/** @param {string} name @param {(ctx: Context) => unknown} fn */
export function test(name, fn) {
  tests.push({ group: currentGroup, name, fn });
}

export class AssertionError extends Error {}

/** @param {unknown} condition @param {string} message */
export function assert(condition, message) {
  if (!condition) throw new AssertionError(message);
}

/** @param {unknown} actual @param {unknown} expected @param {string} message */
export function equal(actual, expected, message) {
  if (!Object.is(actual, expected)) {
    throw new AssertionError(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

/** @param {unknown} actual @param {unknown} expected @param {string} message */
export function deepEqual(actual, expected, message) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new AssertionError(`${message}: expected ${b}, got ${a}`);
}

export const sleep = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Waits until check() returns something truthy, and returns it.
 * @template T
 * @param {() => T} check
 * @param {string} what  for the error message
 * @param {number} [timeout]
 * @returns {Promise<T>}
 */
export async function waitFor(check, what, timeout = 5000) {
  const end = performance.now() + timeout;
  for (;;) {
    const value = check();
    if (value) return value;
    if (performance.now() > end) throw new AssertionError(`timed out after ${timeout} ms waiting for ${what}`);
    await sleep(25);
  }
}

/** Lets popover toggle events and other queued tasks run. */
export const tick = () => sleep(0);

/**
 * Runs every registered test and shows the result in `list` and `summary`.
 * @param {{ list: HTMLElement, summary: HTMLElement, fixture: HTMLElement, only?: string }} where
 */
export async function run({ list, summary, fixture, only }) {
  const results = [];
  const started = performance.now();
  const chosen = only ? tests.filter((t) => `${t.group} ${t.name}`.toLowerCase().includes(only.toLowerCase())) : tests;

  for (const [index, { group, name, fn }] of chosen.entries()) {
    summary.textContent = `Running ${index + 1} of ${chosen.length} …`;
    fixture.replaceChildren();
    const mount = (/** @type {string} */ html) => {
      const root = document.createElement('div');
      root.innerHTML = html; // constant markup from the test file, never data
      fixture.append(root);
      return root;
    };

    let error = null;
    try {
      await fn({ mount, fixture });
    } catch (caught) {
      error = caught;
      if (!(caught instanceof AssertionError)) console.error(caught);
    }
    results.push({ group, name, passed: !error, message: error ? String(error.message ?? error) : '' });
    list.append(resultItem(group, name, error));
  }
  fixture.replaceChildren();

  const failed = results.filter((r) => !r.passed).length;
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  summary.textContent = failed
    ? `${failed} of ${results.length} tests failed (${seconds} s).`
    : `All ${results.length} tests passed (${seconds} s).`;
  summary.dataset.result = failed ? 'fail' : 'pass';
  document.title = `${failed ? '✗' : '✓'} ${results.length - failed}/${results.length} – PiSton tests`;

  window.testResults = { passed: results.length - failed, failed, results };
  document.documentElement.dataset.status = 'done';
}

/** @param {string} group @param {string} name @param {any} error */
function resultItem(group, name, error) {
  const li = document.createElement('li');
  li.dataset.result = error ? 'fail' : 'pass';
  const mark = document.createElement('span');
  mark.className = 'result__mark';
  mark.textContent = error ? '✗ failed' : '✓ passed';
  const title = document.createElement('span');
  title.textContent = group ? `${group} › ${name}` : name;
  li.append(mark, ' ', title);
  if (error) {
    const message = document.createElement('pre');
    message.textContent = String(error.message ?? error);
    li.append(message);
  }
  return li;
}
