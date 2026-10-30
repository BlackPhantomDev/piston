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
import { confirmDialog } from "../dialogs.js";
import { eulaNotice } from "../eula.js";
import { errorText, setStatusText, showError } from "../errors.js";
import { dimensionName, formatSince, formatWhen, providerName } from "../format.js";
import { t } from "../i18n/index.js";
import { fields, view } from "./view.js";

export const titleKey = "nav.home";

// TPS rating below the value: 20 is the target, from 19 nobody notices a difference
const TPS_SMOOTH = 19;
const TPS_SLOW = 15; // below this, players feel the lag clearly

// Page skeleton: texts via data-i18n, data slots via data-field (filled in update()).
const VIEW = `
  <header class="page__header">
    <div class="page__heading">
      <h1 tabindex="-1" data-i18n="nav.home"></h1>
      <div class="page__status">
        <status-badge data-field="state"></status-badge>
        <p class="page__meta page__meta--server">
          <span class="page__server-name" data-field="serverName"></span><span data-field="summary"></span>
        </p>
      </div>
    </div>

    <div class="page__actions" data-field="actions">
      <button class="btn btn--primary" type="button" hidden data-action="start" data-field="startBtn">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>
        <span data-i18n="server.start"></span>
      </button>
      <button class="btn btn--secondary" type="button" hidden data-action="restart" data-field="restartBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>
        <span data-i18n="server.restart"></span>
      </button>
      <button class="btn btn--danger" type="button" hidden data-action="stop" data-field="stopBtn">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>
        <span data-i18n="server.stop"></span>
      </button>
    </div>
  </header>

  <div data-field="eulaSlot"></div>

  <section class="page-section" aria-labelledby="home-server-monitoring">
    <h2 id="home-server-monitoring" data-i18n="home.serverMonitoring"></h2>
    <div class="card-grid">
      <div class="card stat">
        <p class="stat__label" data-i18n="home.players"></p>
        <p class="stat__value"><span data-field="online">–</span><span class="stat__unit" data-field="max"></span></p>
        <meter class="stat__meter" min="0" data-field="playersMeter"></meter>
      </div>
      <div class="card stat">
        <p class="stat__label" data-i18n="home.tps"></p>
        <p class="stat__value" data-field="tps">–</p>
        <p class="stat__hint" data-field="tpsHint" data-i18n="home.tpsTarget"></p>
      </div>
    </div>
  </section>

  <section class="page-section" aria-labelledby="home-system-monitoring">
    <h2 id="home-system-monitoring" data-i18n="home.systemMonitoring"></h2>
    <div class="card-grid">
      <div class="card stat">
        <p class="stat__label" data-i18n="home.ram"></p>
        <p class="stat__value"><span data-field="usedMem">–</span><span class="stat__unit" data-field="maxMem"></span></p>
        <meter class="stat__meter" min="0" data-field="memoryMeter"></meter>
      </div>
      <div class="card stat">
        <p class="stat__label">CPU</p>
        <p class="stat__value" data-field="cpuPercent">–</p>
        <meter class="stat__meter" min="0" data-field="cpuMeter"></meter>
      </div>
    </div>
  </section>

  <section class="card-grid card-grid--wide">
    <div class="card">
      <header class="card__header">
        <h2 tabindex="-1" data-i18n="home.playerList" data-field="playersHeading"></h2>
        <span class="card__meta" data-field="onlineCount"></span>
      </header>
      <ul class="card__list" hidden data-field="players"></ul>
      <p class="card__empty" data-field="playersEmpty" data-i18n="common.loading"></p>
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
      <button class="action-card" type="button" disabled data-quick="save" data-field="saveBtn">
        <span class="action-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11l3 3v13H5z"/><rect x="8" y="13" width="8" height="7"/><line x1="8" y1="4" x2="8" y2="8"/></svg></span>
        <span class="action-card__text">
          <span class="action-card__title" data-i18n="home.quick.save"></span>
          <span class="action-card__sub text-mono">save-all</span>
        </span>
      </button>
      <button class="action-card" type="button" disabled data-quick="backup" data-field="backupBtn">
        <span class="action-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><polyline points="4 4 4 9 9 9"/><polyline points="12 8 12 12 15 14"/></svg></span>
        <span class="action-card__text">
          <span class="action-card__title" data-i18n="home.quick.backup"></span>
          <span class="action-card__sub" data-field="backupInfo"></span>
        </span>
      </button>
      <button class="action-card" type="button" disabled data-quick="say" data-field="sayBtn">
        <span class="action-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/></svg></span>
        <span class="action-card__text">
          <span class="action-card__title" data-i18n="home.quick.say"></span>
          <span class="action-card__sub text-mono">say …</span>
        </span>
      </button>
      <button class="action-card" type="button" disabled data-quick="day" data-field="dayBtn">
        <span class="action-card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="6.5" y2="6.5"/><line x1="17.5" y1="17.5" x2="19" y2="19"/><line x1="5" y1="19" x2="6.5" y2="17.5"/><line x1="17.5" y1="6.5" x2="19" y2="5"/></svg></span>
        <span class="action-card__text">
          <span class="action-card__title" data-i18n="home.quick.day"></span>
          <span class="action-card__sub text-mono">time set day</span>
        </span>
      </button>
    </div>
  </section>

  <!-- To everyone (say) or to one player (tell): title and help are set when it opens -->
  <dialog class="dialog" aria-labelledby="home-message-title" data-field="messageDialog">
    <form class="dialog__form" data-field="messageForm">
      <h2 id="home-message-title" data-field="messageTitle"></h2>
      <div class="field">
        <label class="field__label" for="home-message-input" data-i18n="home.sayDialog.label"></label>
        <input class="input" id="home-message-input" name="message" maxlength="200" required autocomplete="off" aria-describedby="home-message-help">
        <p class="field__help" id="home-message-help" data-field="messageHelp"></p>
      </div>
      <p class="form-error" role="alert" data-field="messageError"></p>
      <div class="dialog__actions">
        <button class="btn btn--ghost" type="button" data-field="messageCancel" data-i18n="common.cancel"></button>
        <button class="btn btn--primary" type="submit" data-i18n="home.sayDialog.send"></button>
      </div>
    </form>
  </dialog>
  `;

// One row per player, created in playerRow() and then updated in place.
const PLAYER_ROW = `
  <li class="list-row">
    <span class="avatar" aria-hidden="true" data-field="initial"></span>
    <div class="list-row__main">
      <p class="list-row__title" data-field="name"></p>
      <p class="list-row__sub" data-field="details"></p>
    </div>
    <span class="list-row__meta" data-field="ping"></span>
    <action-menu data-field="menu">
      <button value="tell" data-i18n="home.playerMenu.tell"></button>
      <button value="op" data-i18n="home.playerMenu.op" data-field="opItem"></button>
      <button value="deop" data-i18n="home.playerMenu.deop" data-field="deopItem"></button>
      <hr>
      <button value="kick" data-danger data-i18n="home.playerMenu.kick"></button>
      <button value="ban" data-danger data-i18n="home.playerMenu.ban"></button>
    </action-menu>
  </li>`;

/** @param {HTMLElement} root */
export function render(root) {
  root.append(view(VIEW));
  const f = fields(root);

  // Shown while eula.txt is not true – the server cannot start before that
  const eula = eulaNotice();
  f.eulaSlot.replaceWith(eula.el);

  let lastStatus;

  function update(status) {
    lastStatus = status;
    f.state.setAttribute("status", status.state);
    eula.update(status.eulaAccepted);
    updateHeader(status);
    updateQuickActions(status);
    updatePlayersData(status.players, status.state);
    // No server process: no RAM/CPU values – "–" instead of a misleading 0
    const running = status.state !== "offline";
    updateMemoryData(status.memory, running);
    updateCpuData(status.cpuPercent, running);

    f.tps.textContent = status.tps === null ? "–" : status.tps.toFixed(1);
    f.tpsHint.textContent = tpsHint(status.tps);
  }

  // "Survival-Welt · Vanilla 26.3 · läuft seit 3 h 12 min" + the buttons that fit the state
  function updateHeader(status) {
    const parts = [`${providerName(status.provider)} ${status.version}`];
    if (status.startedAt) {
      parts.push(t("server.runningFor", { duration: formatSince(status.startedAt) }));
    }
    f.serverName.textContent = status.name;
    f.summary.textContent = parts.join(" · ");

    const running = status.state === "online" || status.state === "starting";
    f.startBtn.hidden = running;
    f.restartBtn.hidden = !running;
    f.stopBtn.hidden = !running;

    // While starting/stopping, nothing can be clicked; without the EULA there is no start
    const busy = status.state === "starting" || status.state === "stopping";
    f.startBtn.disabled = busy || !status.eulaAccepted;
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
    } catch (error) {
      showError(t("home.errors.backup"), error);
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
        run("save-all", t("home.errors.save"));
        break;
      case "day":
        run("time set day", t("home.errors.day"));
        break;
      case "say":
        openMessageDialog(null);
        break;
      case "backup":
        runBackup();
        break;
    }
  });

  /** Sends a console command; if it fails, a notice says what did not happen. */
  async function run(command, title) {
    try {
      await api.sendCommand(command);
    } catch (error) {
      showError(title, error);
    }
  }

  // Message dialog: to everyone (say) or, from the player menu, to one player (tell)
  let messageTarget = null;
  let sending = false;

  function openMessageDialog(player) {
    messageTarget = player;
    f.messageTitle.textContent = player ? t("home.tellDialog.title", { name: player }) : t("home.sayDialog.title");
    f.messageHelp.textContent = player ? t("home.tellDialog.help", { name: player }) : t("home.sayDialog.help");
    f.messageDialog.showModal();
  }

  // One line, whitespace collapsed so it stays a single command.
  // The dialog closes once the message is out – if it fails, the text stays for another try.
  f.messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = f.messageForm.elements.message.value.replace(/\s+/g, " ").trim();
    if (!message || sending) return;
    sending = true;
    setStatusText(f.messageError, "");
    try {
      await api.sendCommand(messageTarget ? `tell ${messageTarget} ${message}` : `say ${message}`);
      f.messageDialog.close();
    } catch (error) {
      setStatusText(f.messageError, t("home.sayDialog.failed", { reason: errorText(error) }), { error: true });
    } finally {
      sending = false;
    }
  });
  f.messageCancel.addEventListener("click", () => f.messageDialog.close());
  f.messageDialog.addEventListener("close", () => {
    f.messageForm.reset();
    setStatusText(f.messageError, "");
  });

  // Player menu (<action-menu> fires "action"); kick and ban ask first
  f.players.addEventListener("action", async (event) => {
    const name = event.target.closest("[data-player]")?.dataset.player;
    const action = event.detail.value;
    if (!name) return;

    if (action === "tell") {
      openMessageDialog(name);
    } else if (action === "op" || action === "deop") {
      run(`${action} ${name}`, t(`home.errors.${action}`, { name }));
    } else if (action === "kick" || action === "ban") {
      const confirmed = await confirmDialog({
        title: t(`home.${action}Dialog.title`, { name }),
        text: t(`home.${action}Dialog.text`, { name }),
        confirmLabel: t(`home.${action}Dialog.confirm`),
        danger: true,
      });
      if (confirmed) run(`${action} ${name}`, t(`home.errors.${action}`, { name }));
    }
  });

  let refocus = false;
  f.actions.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    refocus = true;
    try {
      await api.serverAction(action);
    } catch (error) {
      refocus = false; // nothing changes – focus stays on the button
      showError(t(`home.errors.${action}`), error);
    }
  });

  function updatePlayersData(players, state) {
    f.online.textContent = players.online;
    f.max.textContent = ` / ${players.max}`;
    f.playersMeter.max = players.max;
    f.playersMeter.value = players.online;
    f.onlineCount.textContent = t("home.onlineCount", { count: players.online });
    updatePlayerList(players.list);

    const empty = players.list.length === 0;
    f.players.hidden = empty;
    f.playersEmpty.hidden = !empty;
    f.playersEmpty.textContent = t(state === "online" ? "home.noPlayers" : "home.serverDown");
  }

  // Rows are kept per player and only updated, so focus and an open menu
  // survive the status update every few seconds.
  const playerRows = new Map();

  function updatePlayerList(list) {
    const rows = [...f.players.children];
    const focusedIndex = rows.findIndex((row) => row.contains(document.activeElement));

    const names = new Set(list.map((player) => player.name));
    for (const name of playerRows.keys()) {
      if (!names.has(name)) playerRows.delete(name);
    }

    list.forEach((player, index) => {
      if (!playerRows.has(player.name)) playerRows.set(player.name, playerRow());
      const { row, f: rowFields } = playerRows.get(player.name);
      fillPlayerRow(row, rowFields, player);
      // Only move rows that are out of place – moving a row drops its focus
      if (f.players.children[index] !== row) f.players.insertBefore(row, f.players.children[index] ?? null);
    });
    while (f.players.children.length > list.length) f.players.lastElementChild.remove();

    // The focused player left (e.g. kicked): continue on the row that took its place
    if (focusedIndex !== -1 && !rows[focusedIndex].isConnected) {
      const next = f.players.children[Math.min(focusedIndex, f.players.children.length - 1)];
      (next?.querySelector("action-menu > button") ?? f.playersHeading).focus();
    }
  }

  function updateMemoryData(memory, running) {
    let usedMem = memory.usedMb;
    let maxMem = memory.maxMb;
    f.usedMem.textContent = running ? (usedMem / 1000).toFixed(1) : "–";
    f.maxMem.textContent = ` / ` + ((maxMem / 1000).toFixed(1) + " GB");
    f.memoryMeter.max = memory.maxMb;
    f.memoryMeter.value = running ? memory.usedMb : 0;
  }

  function updateCpuData(cpuP, running) {
    f.cpuPercent.textContent = running ? cpuP.toFixed(2) + " %" : "–";
    f.cpuMeter.max = 100;
    f.cpuMeter.value = running ? cpuP : 0;
  }

  const stopStatus = api.onStatus(update);
  const stopLog = api.onLog((lines) => f.log.add(lines));

  // Cleanup on navigation: stop both subscriptions
  return () => {
    stopStatus();
    stopLog();
  };
}

/** "Ziel 20 · flüssig" – without a value (offline, unknown) just "Ziel 20". */
function tpsHint(tps) {
  if (tps === null) return t("home.tpsTarget");
  const rating = tps >= TPS_SMOOTH ? "smooth" : tps >= TPS_SLOW ? "slow" : "lagging";
  return `${t("home.tpsTarget")} · ${t(`home.tpsRating.${rating}`)}`;
}

function playerRow() {
  const fragment = view(PLAYER_ROW);
  return { row: fragment.firstElementChild, f: fields(fragment) };
}

function fillPlayerRow(row, f, player) {
  row.dataset.player = player.name;
  f.initial.textContent = player.name[0];
  f.name.textContent = player.name;
  const details = [dimensionName(player.dimension)];
  if (player.op) details.push(t("home.op"));
  f.details.textContent = details.join(" · ");
  f.ping.textContent = `${player.pingMs} ms`;
  f.menu.setAttribute("label", t("home.playerMenu.label", { name: player.name }));
  f.opItem.hidden = player.op;
  f.deopItem.hidden = !player.op;
}
