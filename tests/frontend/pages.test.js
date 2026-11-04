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

// The panel on sample data, page by page in an <iframe>: it renders, nothing is
// wider than the screen, and axe-core finds no accessibility violations (WCAG 2.2 AA).

import { assert, deepEqual, equal, group, sleep, test, waitFor } from './runner.js';
import { t } from '../../public/js/i18n/index.js';

const PANEL = new URL('../../public/index.html', import.meta.url);
const WEBSITE = 'https://pistonpanel.dev/';
const REPO = 'https://github.com/BlackPhantomDev/piston';
const AXE = new URL('vendor/axe.min.js', import.meta.url);
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const DESKTOP = 1280;
const PHONE = 375;

/** @type {HTMLIFrameElement} */
const frame = /** @type {any} */ (document.getElementById('page-frame'));

/**
 * Opens a panel address in the frame and waits until `ready` is true in its document.
 * @param {string} address  e.g. "?sim=error#/settings"
 * @param {number} width
 * @param {(doc: Document) => unknown} ready
 * @param {number} [timeout]
 */
async function openPage(address, width, ready, timeout) {
  frame.style.width = `${width}px`;
  // Via about:blank: the same address again, or another hash, would not load the panel anew
  await navigate('about:blank');
  await navigate(new URL(address, PANEL).href);
  const doc = /** @type {Document} */ (frame.contentDocument);
  await waitFor(() => ready(doc), `the page ${address}`, timeout);
  await sleep(300); // let transitions and the first status update settle
  return doc;
}

/** @param {string} url */
function navigate(url) {
  const loaded = new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }));
  frame.src = url;
  return loaded;
}

/** @param {Document} doc */
async function axeViolations(doc) {
  const win = /** @type {any} */ (doc.defaultView);
  if (!win.axe) {
    const script = doc.createElement('script');
    script.src = AXE.href;
    const loaded = new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => reject(new Error(`could not load ${AXE.pathname}`));
    });
    doc.head.append(script);
    await loaded;
  }
  const result = await win.axe.run(doc, { runOnly: { type: 'tag', values: AXE_TAGS } });
  return result.violations.map(
    (/** @type {any} */ v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((/** @type {any} */ n) => n.target.join(' ')).join(', ')}`,
  );
}

/** @param {Document} doc @param {number} width */
function assertFits(doc, width) {
  const scroll = doc.documentElement.scrollWidth;
  assert(scroll <= width, `page is ${scroll} px wide on a ${width} px screen`);
}

/**
 * The required attribution (ADDITIONAL_TERMS, term 1): exactly one notice is visible,
 * "Powered by PiSton" links to the website, "Quellcode" to the repository.
 * @param {Document} doc
 */
function assertAttribution(doc) {
  const visible = [...doc.querySelectorAll('.legal-notice')].filter((el) => el.getClientRects().length > 0);
  equal(visible.length, 1, 'visible attribution notices');
  const notice = visible[0];
  assert(notice.textContent?.includes('Powered by'), '"Powered by" in the attribution');
  const links = [...notice.querySelectorAll('a')];
  const powered = links.find((a) => a.textContent?.trim() === 'PiSton');
  equal(powered?.href, WEBSITE, '"PiSton" link');
  const source = links.find((a) => a.textContent?.trim() === t('legal.source'));
  equal(source?.href, REPO, 'source code link');
}

const status = (/** @type {Document} */ doc) => doc.querySelector('.page__status piston-status-badge')?.getAttribute('data-state');

/** Pages and states: address, what "loaded" means, and the screen widths to check. */
const PAGES = [
  { name: 'Home', address: '#/home', ready: (doc) => status(doc) === 'online', widths: [DESKTOP, PHONE] },
  { name: 'Console', address: '#/console', ready: (doc) => doc.querySelector('.log__line'), widths: [DESKTOP, PHONE] },
  {
    name: 'Settings',
    address: '#/settings',
    ready: (doc) => doc.querySelector('#settings-form:not([aria-busy])') && doc.querySelector('.check-list__item'),
    widths: [DESKTOP, PHONE],
  },
  {
    name: 'Settings, nothing loads (?sim=error)',
    address: '?sim=error#/settings',
    ready: (doc) => doc.querySelectorAll('.load-error:not([hidden])').length >= 2,
    widths: [DESKTOP],
  },
  {
    name: 'Home, EULA not accepted (?sim=eula)',
    address: '?sim=eula#/home',
    ready: (doc) => status(doc) === 'offline' && doc.querySelector('main .eula:not([hidden])'),
    widths: [DESKTOP, PHONE],
  },
  {
    name: 'Device not responding (?sim=lost)',
    address: '?sim=lost#/home',
    ready: (doc) => doc.querySelector('main.unreachable:not([hidden])'),
    widths: [DESKTOP],
    timeout: 20_000, // the screen follows 10 s after the connection breaks
  },
];

group('pages', () => {
  for (const { name, address, ready, widths, timeout } of PAGES) {
    for (const width of widths) {
      test(`${name} at ${width} px: renders, fits, no axe violations`, async () => {
        const doc = await openPage(address, width, ready, timeout);
        assert(doc.querySelector('main:not([hidden]) h1')?.textContent?.trim(), 'a page title');
        assertFits(doc, width);
        assertAttribution(doc);
        deepEqual(await axeViolations(doc), [], 'axe violations');
      });
    }
  }

  test('no custom element stays undefined', async () => {
    const doc = await openPage('#/settings', DESKTOP, PAGES[2].ready);
    deepEqual([...doc.querySelectorAll(':not(:defined)')].map((el) => el.localName), [], 'undefined elements');
  });
});
