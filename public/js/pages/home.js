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
import { fields, view } from "./view.js";

export const titleKey = "nav.home";

// Page skeleton: texts via data-i18n, data slots via data-field (filled in update()).
const VIEW = `
  <h1 tabindex="-1" data-i18n="nav.home"></h1>
  <div>
    <status-badge data-field="state"></status-badge>
  </div>

  <section class="card-grid">
    <div class="card stat">
      <p class="stat__label" data-i18n="home.players"></p>
      <p class="stat__value"><span data-field="online"></span><span class="stat__unit" data-field="max"></span></p>
      <meter class="stat__meter" min="0" data-field="playersMeter"></meter>
    </div>
    <div class="card stat">
      <p class="stat__label" data-i18n="home.tps"></p>
      <p class="stat__value" data-field="tps"></p>
      <p class="stat__label" data-i18n="home.tpsDesc"></p>
    </div>
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
  
  <section id="quickactions"> 
    <h2 tabindex="-1" data-i18n="home.quickactions"></h2>
    
  </section>


  `;

// One row per player, cloned in playerRow().
const PLAYER_ROW = `
  <li class="list-row">
    <span class="avatar" aria-hidden="true" data-field="initial"></span>
    <div class="list-row__main">
      <p class="list-row__title" data-field="name"></p>
    </div>
    <span class="list-row__meta" data-field="ping"></span>
  </li>`;

/** @param {HTMLElement} root */
export function render(root) {
  root.append(view(VIEW));
  const f = fields(root);

  function update(status) {
    f.state.setAttribute("status", status.state);
    updatePlayersData(status.players);
    updateMemoryData(status.memory);
    updateCpuData(status.cpuPercent);

    f.tps.textContent = status.tps.toFixed(1);
  }

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
  f.ping.textContent = `${player.pingMs} ms`;
  return row;
}
