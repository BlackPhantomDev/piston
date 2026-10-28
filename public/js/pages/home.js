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

import * as api from "../api.js";
import { dimensionName, formatSince, formatWhen, providerName } from "../format.js";
import { t } from "../i18n/index.js";
import { fields, view } from "./view.js";

export const titleKey = "nav.home";

// Page skeleton: texts via data-i18n, data slots via data-field (filled in update()).
const VIEW = `
  <header class="page__header">
    <div class="page__heading">
      <h1 tabindex="-1" data-i18n="nav.home"></h1>
      <div class="page__status">
        <status-badge data-field="state"></status-badge>
        <p class="page__meta" data-field="summary"></p>
      </div>
    </div>

    <div class="page__actions" data-field="actions">
      <button class="btn btn--primary" type="button" data-action="start" data-field="startBtn">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>
        <span data-i18n="server.start"></span>
      </button>
      <button class="btn btn--secondary" type="button" data-action="restart" data-field="restartBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>
        <span data-i18n="server.restart"></span>
      </button>
      <button class="btn btn--danger" type="button" data-action="stop" data-field="stopBtn">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>
        <span data-i18n="server.stop"></span>
      </button>
    </div>
  </header>

  <section class="page-section" aria-labelledby="home-server-monitoring">
    <h2 id="home-server-monitoring" data-i18n="home.serverMonitoring"></h2>
    <div class="card-grid">
      <div class="card stat">
        <p class="stat__label" data-i18n="home.players"></p>
        <p class="stat__value"><span data-field="online"></span><span class="stat__unit" data-field="max"></span></p>
        <meter class="stat__meter" min="0" data-field="playersMeter"></meter>
      </div>
      <div class="card stat">
        <p class="stat__label" data-i18n="home.tps"></p>
        <p class="stat__value" data-field="tps"></p>
      </div>
    </div>
  </section>

  <section class="page-section" aria-labelledby="home-system-monitoring">
    <h2 id="home-system-monitoring" data-i18n="home.systemMonitoring"></h2>
    <div class="card-grid">
      <div class="card stat">
        <p class="stat__label" data-i18n="home.ram"></p>
        <p class="stat__value"><span data-field="usedMem"></span><span class="stat__unit" data-field="maxMem"></span></p>
        <meter class="stat__meter" min="0" data-field="memoryMeter"></meter>
      </div>
      <div class="card stat">
        <p class="stat__label">CPU</p>
        <p class="stat__value" data-field="cpuPercent"></p>
        <meter class="stat__meter" min="0" data-field="cpuMeter"></meter>
      </div>
    </div>
  </section>

  <section class="card-grid card-grid--wide">
    <div class="card">
      <header class="card__header">
        <h2 data-i18n="home.playerList"></h2>
      </header>
      <ul class="card__list" data-field="players"></ul>
    </div>

    <div class="card">
      <header class="card__header">
        <h2 data-i18n="home.console"></h2>
        <a class="card__link" href="#/console" data-i18n="home.consoleLink"></a>
      </header>
      <div class="card__body card__body--console">
        <log-view class="log--truncate" limit="8" data-field="log"></log-view>
      </div>
    </div>
  </section>
  
  <section class="page-section" aria-labelledby="home-quickactions">
    <h2 id="home-quickactions" data-i18n="home.quickactions"></h2>
    <div class="card-grid" data-field="quick">
      <button class="action-card" type="button" data-quick="save" data-field="saveBtn">
        <span class="action-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11l3 3v13H5z"/><rect x="8" y="13" width="8" height="7"/><line x1="8" y1="4" x2="8" y2="8"/></svg></span>
        <span class="action-card__text">
          <span class="action-card__title" data-i18n="home.quick.save"></span>
          <span class="action-card__sub text-mono">save-all</span>
        </span>
      </button>
      <button class="action-card" type="button" data-quick="backup" data-field="backupBtn">
        <span class="action-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><polyline points="4 4 4 9 9 9"/><polyline points="12 8 12 12 15 14"/></svg></span>
        <span class="action-card__text">
          <span class="action-card__title" data-i18n="home.quick.backup"></span>
          <span class="action-card__sub" data-field="backupInfo"></span>
        </span>
      </button>
      <button class="action-card" type="button" data-quick="say" data-field="sayBtn">
        <span class="action-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/></svg></span>
        <span class="action-card__text">
          <span class="action-card__title" data-i18n="home.quick.say"></span>
          <span class="action-card__sub text-mono">say …</span>
        </span>
      </button>
      <button class="action-card" type="button" data-quick="day" data-field="dayBtn">
        <span class="action-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="6.5" y2="6.5"/><line x1="17.5" y1="17.5" x2="19" y2="19"/><line x1="5" y1="19" x2="6.5" y2="17.5"/><line x1="17.5" y1="6.5" x2="19" y2="5"/></svg></span>
        <span class="action-card__text">
          <span class="action-card__title" data-i18n="home.quick.day"></span>
          <span class="action-card__sub text-mono">time set day</span>
        </span>
      </button>
    </div>
  </section>

  <dialog class="dialog" aria-labelledby="home-say-title" data-field="sayDialog">
    <form class="dialog__form" data-field="sayForm">
      <h2 id="home-say-title" data-i18n="home.sayDialog.title"></h2>
      <div class="field">
        <label class="field__label" for="home-say-input" data-i18n="home.sayDialog.label"></label>
        <input class="input" id="home-say-input" name="message" maxlength="200" required autocomplete="off" aria-describedby="home-say-help">
        <p class="field__help" id="home-say-help" data-i18n="home.sayDialog.help"></p>
      </div>
      <div class="dialog__actions">
        <button class="btn btn--ghost" type="button" data-field="sayCancel" data-i18n="common.cancel"></button>
        <button class="btn btn--primary" type="submit" data-i18n="home.sayDialog.send"></button>
      </div>
    </form>
  </dialog>
  `;

// One row per player, cloned in playerRow().
const PLAYER_ROW = `
  <li class="list-row">
    <span class="avatar" aria-hidden="true" data-field="initial"></span>
    <div class="list-row__main">
      <p class="list-row__title" data-field="name"></p>
      <p class="list-row__sub" data-field="dimension"></p>
    </div>
    <span class="list-row__meta" data-field="ping"></span>
  </li>`;

/** @param {HTMLElement} root */
export function render(root) {
  root.append(view(VIEW));
  const f = fields(root);

  let lastStatus;

  function update(status) {
    lastStatus = status;
    f.state.setAttribute("status", status.state);
    updateHeader(status);
    updateQuickActions(status);
    updatePlayersData(status.players);
    updateMemoryData(status.memory);
    updateCpuData(status.cpuPercent);

    f.tps.textContent = status.tps === null ? "–" : status.tps.toFixed(1);
  }

  // "Vanilla 26.3 · läuft seit 3 h 12 min" + the buttons that fit the state
  function updateHeader(status) {
    const parts = [`${providerName(status.provider)} ${status.version}`];
    if (status.startedAt) {
      parts.push(t("server.runningFor", { duration: formatSince(status.startedAt) }));
    }
    f.summary.textContent = parts.join(" · ");

    const running = status.state === "online" || status.state === "starting";
    f.startBtn.hidden = running;
    f.restartBtn.hidden = !running;
    f.stopBtn.hidden = !running;

    // While starting/stopping, nothing can be clicked
    const busy = status.state === "starting" || status.state === "stopping";
    f.startBtn.disabled = busy;
    f.restartBtn.disabled = busy;
    f.stopBtn.disabled = busy;

    // The clicked button may now be hidden – hand focus to the one that replaced it
    if (refocus && !busy) {
      refocus = false;
      f.actions.querySelector("button:not([hidden])")?.focus();
    }
  }

  // Quick actions: commands need a running server, a backup only a settled one
  let backupRunning = false;

  function updateQuickActions(status) {
    const online = status.state === "online";
    f.saveBtn.disabled = !online;
    f.sayBtn.disabled = !online;
    f.dayBtn.disabled = !online;

    const busy = status.state === "starting" || status.state === "stopping";
    f.backupBtn.disabled = busy || backupRunning;
    if (backupRunning) {
      f.backupInfo.textContent = t("home.quick.backupRunning");
    } else if (status.lastBackupAt) {
      f.backupInfo.textContent = t("home.quick.lastBackup", { when: formatWhen(status.lastBackupAt) });
    } else {
      f.backupInfo.textContent = t("home.quick.noBackup");
    }
  }

  async function runBackup() {
    backupRunning = true;
    updateQuickActions(lastStatus);
    try {
      await api.createBackup();
    } finally {
      backupRunning = false;
      updateQuickActions(lastStatus);
      if (document.activeElement === document.body) f.backupBtn.focus();
    }
  }

  f.quick.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick]");
    if (!button || button.disabled) return;
    switch (button.dataset.quick) {
      case "save":
        api.sendCommand("save-all");
        break;
      case "day":
        api.sendCommand("time set day");
        break;
      case "say":
        f.sayDialog.showModal();
        break;
      case "backup":
        runBackup();
        break;
    }
  });

  // "Nachricht an alle": one line, whitespace collapsed so it stays a single command
  f.sayForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = f.sayForm.elements.message.value.replace(/\s+/g, " ").trim();
    if (!message) return;
    api.sendCommand(`say ${message}`);
    f.sayDialog.close();
  });
  f.sayCancel.addEventListener("click", () => f.sayDialog.close());
  f.sayDialog.addEventListener("close", () => f.sayForm.reset());

  let refocus = false;
  f.actions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    refocus = true;
    api.serverAction(button.dataset.action);
  });

  function updatePlayersData(players) {
    f.online.textContent = players.online;
    f.max.textContent = ` / ${players.max}`;
    f.playersMeter.max = players.max;
    f.playersMeter.value = players.online;
    f.players.replaceChildren(...players.list.map(playerRow));
  }

  function updateMemoryData(memory) {
    let usedMem = memory.usedMb;
    let maxMem = memory.maxMb;
    f.usedMem.textContent = (usedMem / 1000).toFixed(1);
    f.maxMem.textContent = ` / ` + ((maxMem / 1000).toFixed(1) + " GB");
    f.memoryMeter.max = memory.maxMb;
    f.memoryMeter.value = memory.usedMb;
  }

  function updateCpuData(cpuP) {
    f.cpuPercent.textContent = cpuP.toFixed(2) + " %";
    f.cpuMeter.max = 100;
    f.cpuMeter.value = cpuP;
  }

  const stopStatus = api.onStatus(update);
  const stopLog = api.onLog((lines) => f.log.add(lines));

  // Cleanup on navigation: stop both subscriptions
  return () => {
    stopStatus();
    stopLog();
  };
}

function playerRow(player) {
  const row = view(PLAYER_ROW);
  const f = fields(row);
  f.initial.textContent = player.name[0];
  f.name.textContent = player.name;
  f.dimension.textContent = dimensionName(player.dimension);
  f.ping.textContent = `${player.pingMs} ms`;
  return row;
}
