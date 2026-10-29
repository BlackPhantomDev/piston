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

import * as api from './api.js';
import { setupCopyButton } from './clipboard.js';
import { clearNotices } from './errors.js';
import { formatWhen } from './format.js';
import { t } from './i18n/index.js';
import { fields, view } from './pages/view.js';

const GRACE_MS = 10_000; // short outages only get the banner (mockup 06-A)
const RESTORED_MS = 3000; // how long "Verbindung wiederhergestellt" stays (06-D)
const TICK_MS = 1000;

const SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const ICON_UNLINKED = `<svg ${SVG}><path d="M9 7H7a5 5 0 0 0 0 10h2"/><path d="M15 7h2a5 5 0 0 1 0 10h-2"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/></svg>`;
const ICON_PLUG_OFF = `<svg ${SVG}><path d="M9 3v4M15 3v4"/><path d="M6 7h12v4a6 6 0 0 1-12 0z"/><path d="M12 17v4"/><line x1="3" y1="3" x2="21" y2="21"/></svg>`;
const ICON_SPINNER = `<svg class="spinner" ${SVG}><path d="M21 12a9 9 0 1 1-6.2-8.6"/></svg>`;
const ICON_RETRY = `<svg ${SVG}><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>`;
const ICON_COPY = `<svg class="icon-copy" ${SVG}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>`;
const ICON_DONE = `<svg class="icon-done" ${SVG} stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>`;

/** @param {string} command */
const commandBlock = (command) => `
  <div class="command">
    <code><span class="command__prompt" aria-hidden="true">$ </span><span data-command>${command}</span></code>
    <button class="command__copy" type="button" data-i18n-label="connection.copyCommand">
      ${ICON_COPY}${ICON_DONE}
      <span class="tooltip" aria-hidden="true" data-i18n="connection.copyCommand"></span>
    </button>
  </div>`;

// Banner (A: lost, D: restored), live region and the "Panel nicht erreichbar" screen (B, C).
// The screen is a second <main>: only one of the two is ever visible (the other has hidden).
const VIEW = `
  <div class="connection-banner" role="region" data-i18n-label="connection.region" hidden data-field="banner">
    <span class="connection-banner__lost" aria-hidden="true">${ICON_UNLINKED}</span>
    <span class="connection-banner__marker" aria-hidden="true"></span>
    <p class="connection-banner__text" data-field="bannerText"></p>
    <span class="connection-banner__lost connection-banner__busy" aria-hidden="true">${ICON_SPINNER}</span>
  </div>
  <p class="visually-hidden" role="status" data-field="announce"></p>

  <main class="page unreachable" hidden aria-labelledby="unreachable-title" data-field="screen">
    <div class="unreachable__inner">
      <div class="unreachable__icon" aria-hidden="true">${ICON_PLUG_OFF}</div>
      <p class="connection-pill">${ICON_UNLINKED}<span data-i18n="connection.badge"></span></p>
      <h1 id="unreachable-title" tabindex="-1" data-i18n="connection.title" data-field="title"></h1>
      <p class="unreachable__lead" data-i18n="connection.lead"></p>
      <p class="unreachable__origin"><span data-i18n="connection.openedVia"></span> <span class="text-mono" data-field="origin"></span></p>

      <div class="card retry">
        <div class="retry__head">
          <p class="retry__next" data-field="next"></p>
          <p class="retry__attempt" data-field="attempt"></p>
        </div>
        <div class="retry__bar" aria-hidden="true"><span class="retry__fill" data-field="fill"></span></div>
        <div class="retry__foot">
          <p class="retry__last" data-field="last"></p>
          <div class="retry__action">
            <button class="btn btn--primary" type="button" data-field="retryBtn">
              <span class="retry__icon" aria-hidden="true">${ICON_RETRY}</span>
              <span class="retry__busy" aria-hidden="true">${ICON_SPINNER}</span>
              <span data-field="retryLabel"></span>
            </button>
            <p class="retry__failed" hidden data-field="failed">${ICON_UNLINKED}<span data-field="failedText"></span></p>
          </div>
        </div>
      </div>

      <h2 class="unreachable__checks" data-i18n="connection.checks.title"></h2>
      <ol class="card check-steps" role="list">
        <li>
          <p class="check-steps__title" data-i18n="connection.checks.powerTitle"></p>
          <p class="check-steps__text" data-i18n="connection.checks.powerText"></p>
        </li>
        <li>
          <p class="check-steps__title" data-i18n="connection.checks.networkTitle"></p>
          <p class="check-steps__text" data-i18n="connection.checks.networkText"></p>
        </li>
        <li>
          <p class="check-steps__title" data-i18n="connection.checks.serviceTitle"></p>
          <p class="check-steps__text" data-i18n="connection.checks.serviceText"></p>
          ${commandBlock('systemctl status piston')}
          <p class="check-steps__text" data-i18n="connection.checks.serviceLog"></p>
          ${commandBlock('journalctl -u piston -e')}
        </li>
        <li>
          <p class="check-steps__title" data-i18n="connection.checks.addressTitle"></p>
          <p class="check-steps__text" data-i18n="connection.checks.addressText"></p>
          <p class="check-steps__link" data-field="hostSlot"></p>
          <p class="check-steps__text" data-i18n="connection.checks.addressHint"></p>
        </li>
      </ol>
      <p class="visually-hidden" role="status" data-field="copyStatus"></p>

      <p class="unreachable__note" data-i18n="connection.note"></p>
    </div>
  </main>`;

/**
 * Shows what happens while the panel cannot be reached (mockups 06):
 * A – first seconds: banner, page dimmed and out of reach;
 * B/C – after GRACE_MS: the "Panel nicht erreichbar" screen with countdown and checks;
 * D – back online: page as it was (unsaved input included), short confirmation.
 * The page itself is never thrown away, only hidden.
 * @param {HTMLElement} main  the router's outlet
 */
export function initConnectionView(main) {
  const fragment = view(VIEW);
  const f = fields(fragment);
  const content = /** @type {HTMLElement} */ (main.parentElement);
  content.prepend(f.banner, f.announce);
  main.after(f.screen);

  const staleNote = document.getElementById('address-stale');
  f.origin.textContent = location.origin;

  for (const button of f.screen.querySelectorAll('.command__copy')) {
    const code = button.parentElement.querySelector('[data-command]');
    setupCopyButton(button, {
      text: () => code.textContent,
      status: f.copyStatus,
      onFailed: () => getSelection()?.selectAllChildren(code),
    });
  }

  // "Hat sich die Adresse geändert?": the hostname PiSton reported while it was reachable
  f.hostSlot.textContent = t('connection.checks.addressUnknown');
  let host = '';
  api.onStatus((status) => {
    if (status.host === host) return;
    host = status.host;
    const port = location.port ? `:${location.port}` : '';
    if (host) {
      const link = document.createElement('a');
      link.className = 'text-mono';
      link.href = `${location.protocol}//${host}.local${port}`;
      link.textContent = link.href.replace(/\/$/, '');
      f.hostSlot.replaceChildren(link);
    }
  });

  /** @type {'online' | 'brief' | 'screen'} */
  let phase = 'online';
  /** @type {import('./api.js').Connection | null} */
  let connection = null;
  let graceTimer = 0;
  let tickTimer = 0;
  let restoredTimer = 0;

  f.retryBtn.addEventListener('click', () => {
    if (f.retryBtn.getAttribute('aria-disabled') !== 'true') api.reconnectNow();
  });

  api.onConnection((next) => {
    const failedNow = next.manualAttemptFailed && !connection?.manualAttemptFailed;
    connection = next;
    if (next.state === 'lost') {
      if (phase === 'online') enterBrief();
      else if (phase === 'screen') renderRetry();
      if (failedNow) announce(t('connection.failedAnnounce', { seconds: secondsLeft() }));
    } else if (phase !== 'online') {
      restore();
    }
  });

  function enterBrief() {
    phase = 'brief';
    clearTimeout(restoredTimer);
    closeOverlays();
    main.inert = true;
    main.classList.add('page--waiting');
    showBanner('lost', t('connection.lostShort'));
    announce(t('connection.lostShort'));
    graceTimer = setTimeout(enterScreen, GRACE_MS);
  }

  function enterScreen() {
    phase = 'screen';
    f.banner.hidden = true;
    const active = document.activeElement;
    const focusWasInPage = !active || active === document.body || main.contains(active);
    main.hidden = true;
    f.screen.hidden = false;
    if (staleNote) staleNote.hidden = false;
    renderRetry();
    tickTimer = setInterval(renderRetry, TICK_MS);
    // The page under the cursor is gone – continue on the screen's heading
    if (focusWasInPage) f.title.focus();
    else announce(t('connection.title'));
  }

  function restore() {
    clearTimeout(graceTimer);
    clearInterval(tickTimer);
    const focusWasOnScreen = f.screen.contains(document.activeElement);
    f.screen.hidden = true;
    main.hidden = false;
    main.inert = false;
    main.classList.remove('page--waiting');
    if (staleNote) staleNote.hidden = true;
    phase = 'online';
    showBanner('restored', t('connection.restored'));
    announce(t('connection.restored'));
    restoredTimer = setTimeout(() => {
      f.banner.hidden = true;
    }, RESTORED_MS);
    if (focusWasOnScreen) /** @type {HTMLElement | null} */ (main.querySelector('h1'))?.focus();
  }

  /** Countdown, progress bar, button and the "noch nicht erreichbar" line (06-B, C1, C2). */
  function renderRetry() {
    if (!connection) return;
    f.attempt.textContent = t('connection.attempt', { n: connection.attempt });
    f.last.textContent = connection.lastConnectedAt
      ? t('connection.lastConnected', { when: formatWhen(new Date(connection.lastConnectedAt).toISOString()) })
      : '';

    if (connection.trying) {
      f.next.replaceChildren(t('connection.trying'), ' ', muted(t('connection.paused')));
      f.retryBtn.setAttribute('aria-disabled', 'true'); // stays focusable, unlike disabled
      f.retryBtn.dataset.busy = '';
      f.retryLabel.textContent = t('connection.retrying');
    } else {
      const seconds = secondsLeft();
      f.next.replaceChildren(`${t('connection.nextIn')} `, number(seconds), ' s');
      const elapsed = 1 - ((connection.nextAttemptAt ?? 0) - Date.now()) / connection.retryDelayMs;
      f.fill.style.width = `${Math.round(Math.min(1, Math.max(0, elapsed)) * 100)}%`;
      f.retryBtn.removeAttribute('aria-disabled');
      delete f.retryBtn.dataset.busy;
      f.retryLabel.textContent = t('connection.retry');
    }

    f.failed.hidden = !connection.manualAttemptFailed || connection.trying;
    if (!f.failed.hidden) f.failedText.replaceChildren(`${t('connection.failed')} `, number(secondsLeft()), ' s');
  }

  function secondsLeft() {
    return Math.max(0, Math.ceil(((connection?.nextAttemptAt ?? 0) - Date.now()) / 1000));
  }

  /** @param {'lost' | 'restored'} state @param {string} text */
  function showBanner(state, text) {
    f.banner.dataset.state = state;
    f.bannerText.textContent = text;
    f.banner.hidden = false;
  }

  /** @param {string} text */
  function announce(text) {
    f.announce.textContent = text;
  }
}

/** Dialogs, menus and notices belong to the page that just went out of reach. */
function closeOverlays() {
  for (const dialog of document.querySelectorAll('dialog[open]')) /** @type {HTMLDialogElement} */ (dialog).close();
  for (const popover of document.querySelectorAll(':popover-open')) /** @type {HTMLElement} */ (popover).hidePopover();
  clearNotices();
}

/** @param {number} value */
function number(value) {
  const el = document.createElement('span');
  el.className = 'retry__number';
  el.textContent = String(value);
  return el;
}

/** @param {string} text */
function muted(text) {
  const el = document.createElement('span');
  el.className = 'text-muted';
  el.textContent = text;
  return el;
}
