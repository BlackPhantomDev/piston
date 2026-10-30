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

import * as api from '../api.js';
import { confirmDialog } from '../dialogs.js';
import { eulaNotice } from '../eula.js';
import { errorText, hideLoadError, setStatusText, showLoadError } from '../errors.js';
import { formatWhen, providerName } from '../format.js';
import { t } from '../i18n/index.js';
import { onBeforeLeave } from '../router.js';
import { compareVersions, requiredJava } from '../versions.js';
import { fields, view } from './view.js';

export const titleKey = 'nav.settings';

const AUTO_RESTART_TIMES = ['03:00', '04:00', '05:00', '06:00'];
const SWITCH_STEPS = ['stop', 'backup', 'download', 'swap', 'start'];
const EULA_URL = 'https://aka.ms/MinecraftEULA';
const SPY_LINE_PX = 120; // section counts as "in view" once its top passes this line
const PLAYER_NAME = /^\w{3,16}$/; // Minecraft names: 3–16 letters, digits or _

// Page skeleton (mockup 04). Fields carry the server.properties key as name;
// data-scope="panel" marks panel-side settings that are not in that file.
const VIEW = `
  <div class="page__narrow">
    <header class="page__header">
      <div class="page__heading">
        <h1 tabindex="-1" data-i18n="settings.title"></h1>
        <p class="page__meta" data-i18n="settings.subtitle"></p>
      </div>
    </header>

    <div data-field="eulaSlot"></div>

    <nav class="choice-chips" data-i18n-label="settings.sectionsLabel" data-field="sectionNav">
      <button class="choice-chip" type="button" data-target="settings-general" data-i18n="settings.sections.general"></button>
      <button class="choice-chip" type="button" data-target="settings-world" data-i18n="settings.sections.world"></button>
      <button class="choice-chip" type="button" data-target="settings-players" data-i18n="settings.sections.players"></button>
      <button class="choice-chip" type="button" data-target="settings-performance" data-i18n="settings.sections.performance"></button>
      <button class="choice-chip" type="button" data-target="settings-lists" data-i18n="settings.sections.lists"></button>
      <button class="choice-chip" type="button" data-target="settings-version" data-i18n="settings.sections.version"></button>
      <button class="choice-chip" type="button" data-target="settings-danger" data-i18n="settings.sections.danger"></button>
    </nav>

    <div hidden data-field="formError"></div>

    <form class="page__narrow" id="settings-form" novalidate inert aria-busy="true" data-field="form">
      <section class="card page-anchor" id="settings-general" aria-labelledby="settings-general-title">
        <header class="card__header">
          <h2 id="settings-general-title" tabindex="-1" data-i18n="settings.sections.general"></h2>
        </header>
        <div class="card__body form-grid">
          <mc-field class="form-grid__wide" data-i18n-help="settings.motdHelp">
            <label data-i18n="settings.motd"></label>
            <input class="input" name="motd" maxlength="59" autocomplete="off">
          </mc-field>
          <mc-field>
            <label data-i18n="settings.maxPlayers"></label>
            <mc-stepper><input type="number" name="max-players" min="1" max="100" step="1" required></mc-stepper>
          </mc-field>
          <mc-field>
            <label data-i18n="settings.gamemode"></label>
            <div class="select">
              <select class="input" name="gamemode">
                <option value="survival" data-i18n="settings.gamemodes.survival"></option>
                <option value="creative" data-i18n="settings.gamemodes.creative"></option>
                <option value="adventure" data-i18n="settings.gamemodes.adventure"></option>
                <option value="spectator" data-i18n="settings.gamemodes.spectator"></option>
              </select>
            </div>
          </mc-field>
          <mc-field>
            <label data-i18n="settings.difficulty"></label>
            <div class="select">
              <select class="input" name="difficulty">
                <option value="peaceful" data-i18n="settings.difficulties.peaceful"></option>
                <option value="easy" data-i18n="settings.difficulties.easy"></option>
                <option value="normal" data-i18n="settings.difficulties.normal"></option>
                <option value="hard" data-i18n="settings.difficulties.hard"></option>
              </select>
            </div>
          </mc-field>
        </div>
      </section>

      <section class="card page-anchor" id="settings-world" aria-labelledby="settings-world-title">
        <header class="card__header">
          <h2 id="settings-world-title" tabindex="-1" data-i18n="settings.sections.world"></h2>
        </header>
        <div class="card__body form-grid">
          <mc-field>
            <label data-i18n="settings.levelName"></label>
            <input class="input input--mono" name="level-name" required autocomplete="off" spellcheck="false">
          </mc-field>
          <mc-field data-i18n-help="settings.seedHelp">
            <label data-i18n="settings.seed"></label>
            <input class="input input--mono" name="level-seed" autocomplete="off" spellcheck="false"
                   data-i18n-placeholder="settings.seedPlaceholder">
          </mc-field>
          <mc-field>
            <label><span data-i18n="settings.viewDistance"></span> · <output for="settings-view-distance"></output> <span data-i18n="settings.chunks"></span></label>
            <mc-range><input type="range" id="settings-view-distance" name="view-distance" min="2" max="32" step="1"></mc-range>
          </mc-field>
          <mc-field>
            <label><span data-i18n="settings.simulationDistance"></span> · <output for="settings-simulation-distance"></output> <span data-i18n="settings.chunks"></span></label>
            <mc-range><input type="range" id="settings-simulation-distance" name="simulation-distance" min="3" max="32" step="1"></mc-range>
          </mc-field>
        </div>
        <div class="setting-list">
          <mc-toggle layout="row" name="allow-nether" data-i18n="settings.allowNether" data-i18n-description="settings.allowNetherHelp"></mc-toggle>
          <mc-toggle layout="row" name="generate-structures" data-i18n="settings.generateStructures" data-i18n-description="settings.generateStructuresHelp"></mc-toggle>
        </div>
      </section>

      <section class="card page-anchor" id="settings-players" aria-labelledby="settings-players-title">
        <header class="card__header">
          <h2 id="settings-players-title" tabindex="-1" data-i18n="settings.sections.players"></h2>
        </header>
        <div class="setting-list">
          <mc-toggle layout="row" name="white-list" data-i18n="settings.whitelist" data-i18n-description="settings.whitelistHelp"></mc-toggle>
          <mc-toggle layout="row" name="pvp" data-i18n="settings.pvp" data-i18n-description="settings.pvpHelp"></mc-toggle>
          <mc-toggle layout="row" name="online-mode" data-i18n="settings.onlineMode" data-i18n-description="settings.onlineModeHelp"></mc-toggle>
          <mc-toggle layout="row" name="hardcore" data-i18n="settings.hardcore" data-i18n-description="settings.hardcoreHelp"></mc-toggle>
          <mc-toggle layout="row" name="enable-command-block" data-i18n="settings.commandBlocks" data-i18n-description="settings.commandBlocksHelp"></mc-toggle>
          <mc-toggle layout="row" name="allow-flight" data-i18n="settings.allowFlight" data-i18n-description="settings.allowFlightHelp"></mc-toggle>
        </div>
        <div class="card__body form-grid">
          <mc-field>
            <label data-i18n="settings.spawnProtection"></label>
            <div class="input-group">
              <input type="number" name="spawn-protection" min="0" max="64" step="1" required>
              <span class="input-group__addon" data-i18n="settings.blocks"></span>
            </div>
          </mc-field>
          <mc-field data-i18n-help="settings.idleTimeoutHelp">
            <label data-i18n="settings.idleTimeout"></label>
            <div class="input-group">
              <input type="number" name="player-idle-timeout" min="0" max="1440" step="1" required>
              <span class="input-group__addon" data-i18n="settings.minutes"></span>
            </div>
          </mc-field>
        </div>
      </section>

      <section class="card page-anchor" id="settings-performance" aria-labelledby="settings-performance-title">
        <header class="card__header">
          <h2 id="settings-performance-title" tabindex="-1" data-i18n="settings.sections.performance"></h2>
        </header>
        <div class="card__body form-grid">
          <mc-field data-i18n-help="settings.memoryHelp">
            <label data-i18n="settings.memory"></label>
            <div class="input-group">
              <input type="number" name="memoryMb" data-scope="panel" min="512" max="7168" step="256" required>
              <span class="input-group__addon">MB</span>
            </div>
          </mc-field>
          <mc-field data-i18n-help="settings.serverPortHelp">
            <label data-i18n="settings.serverPort"></label>
            <input class="input input--mono" type="number" name="server-port" min="1" max="65535" step="1" required>
          </mc-field>
          <mc-field>
            <label data-i18n="settings.autoRestart"></label>
            <div class="select">
              <select class="input" name="autoRestart" data-scope="panel" data-field="autoRestart"></select>
            </div>
          </mc-field>
        </div>
      </section>
    </form>

    <!-- Outside the form: list changes apply at once, without the save bar -->
    <section class="card page-anchor" id="settings-lists" aria-labelledby="settings-lists-title">
      <header class="card__header">
        <h2 id="settings-lists-title" tabindex="-1" data-i18n="settings.sections.lists"></h2>
        <span class="card__meta" data-i18n="settings.lists.immediate"></span>
      </header>
      <div class="card__body card__body--stack">
        <fieldset class="choice-chips" data-field="listTabs">
          <legend class="visually-hidden" data-i18n="settings.lists.label"></legend>
          <label class="choice-chip"><input type="radio" name="settings-list" value="whitelist" checked><span data-i18n="settings.lists.whitelist"></span><span class="choice-chip__count" data-count="whitelist"></span></label>
          <label class="choice-chip"><input type="radio" name="settings-list" value="ops"><span data-i18n="settings.lists.ops"></span><span class="choice-chip__count" data-count="ops"></span></label>
          <label class="choice-chip"><input type="radio" name="settings-list" value="bans"><span data-i18n="settings.lists.bans"></span><span class="choice-chip__count" data-count="bans"></span></label>
        </fieldset>
        <p class="list-note" hidden data-field="listNote"></p>
        <form class="list-add" novalidate data-field="listForm">
          <mc-field data-field="nameField">
            <label data-i18n="settings.lists.name"></label>
            <input class="input" name="player" maxlength="16" autocomplete="off" autocapitalize="off" spellcheck="false">
          </mc-field>
          <mc-field hidden data-field="reasonField">
            <label data-i18n="settings.lists.reason"></label>
            <input class="input" name="reason" maxlength="100" autocomplete="off">
          </mc-field>
          <button class="btn btn--primary" type="submit" data-field="addBtn"></button>
        </form>
        <p class="form-error" role="alert" data-field="listError"></p>
        <div hidden data-field="listsError"></div>
      </div>
      <ul class="card__list" hidden data-field="entries"></ul>
      <p class="card__empty" data-i18n="common.loading" data-field="entriesEmpty"></p>
      <p class="visually-hidden" role="status" data-field="listStatus"></p>
    </section>

    <section class="card page-anchor" id="settings-version" aria-labelledby="settings-version-title">
      <header class="card__header">
        <h2 id="settings-version-title" tabindex="-1" data-i18n="settings.sections.version"></h2>
        <p class="info-pill">
          <span class="info-pill__label" data-i18n="settings.installed"></span>
          <span class="info-pill__value" data-field="installed"></span>
        </p>
      </header>
      <div class="card__body card__body--stack">
        <fieldset class="option-cards" data-field="providers">
          <legend data-i18n="settings.provider"></legend>
          <label class="option-card">
            <input type="radio" name="provider" value="vanilla">
            <span class="option-card__title">Vanilla</span>
            <span class="option-card__sub" data-i18n="settings.providers.vanilla"></span>
          </label>
          <label class="option-card">
            <input type="radio" name="provider" value="paper">
            <span class="option-card__title">Paper</span>
            <span class="option-card__sub" data-i18n="settings.providers.paper"></span>
          </label>
          <label class="option-card">
            <input type="radio" name="provider" value="fabric">
            <span class="option-card__title">Fabric</span>
            <span class="option-card__sub" data-i18n="settings.providers.fabric"></span>
          </label>
          <label class="option-card">
            <input type="radio" name="provider" value="forge" disabled>
            <span class="option-card__title">Forge / NeoForge</span>
            <span class="option-card__sub" data-i18n="settings.providers.forge"></span>
          </label>
        </fieldset>

        <div class="field">
          <mc-field>
            <label data-i18n="settings.mcVersion"></label>
            <div class="select">
              <select class="input input--mono" data-field="versionSelect"><option value="" data-i18n="settings.versionsLoading"></option></select>
            </div>
          </mc-field>
          <label class="checkbox">
            <input type="checkbox" data-field="snapshots">
            <span data-i18n="settings.snapshots"></span>
          </label>
        </div>

        <div hidden data-field="versionsError"></div>

        <div class="check-list" aria-live="polite" data-field="checkList">
          <p class="check-list__title" data-i18n="settings.checks.title"></p>
          <ul data-field="checks"></ul>
        </div>

        <div class="version-switch">
          <div>
            <ol class="steps" data-i18n-label="settings.steps.label" data-field="steps"></ol>
            <p class="version-switch__status" role="status" data-field="switchStatus"></p>
          </div>
          <button class="btn btn--primary btn--l" type="button" disabled data-field="switchBtn" data-i18n="settings.switchVersion"></button>
        </div>
      </div>
    </section>

    <section class="card card--danger page-anchor" id="settings-danger" aria-labelledby="settings-danger-title">
      <header class="card__header">
        <h2 id="settings-danger-title" tabindex="-1" data-i18n="settings.sections.danger"></h2>
      </header>
      <div class="option-row">
        <div class="option-row__text">
          <p class="option-row__title" data-i18n="settings.resetWorld"></p>
          <p class="option-row__desc" data-i18n="settings.resetWorldHelp"></p>
          <p class="option-row__desc" role="status" data-field="resetWorldStatus"></p>
        </div>
        <button class="btn btn--danger" type="button" data-field="resetWorldBtn" data-i18n="settings.resetWorld"></button>
      </div>
      <div class="option-row">
        <div class="option-row__text">
          <p class="option-row__title" data-i18n="settings.resetDefaults"></p>
          <p class="option-row__desc" data-i18n="settings.resetDefaultsHelp"></p>
        </div>
        <button class="btn btn--outline-danger" type="button" data-field="resetDefaultsBtn" data-i18n="settings.resetDefaultsButton"></button>
      </div>
    </section>
  </div>

  <div class="save-bar">
    <p class="save-bar__status" role="status" data-field="saveStatus"></p>
    <div class="save-bar__actions">
      <button class="btn btn--ghost" type="button" disabled data-field="discardBtn" data-i18n="settings.discard"></button>
      <button class="btn btn--secondary" type="submit" form="settings-form" value="save" disabled data-field="saveBtn" data-i18n="settings.save"></button>
      <button class="btn btn--primary" type="submit" form="settings-form" value="restart" disabled data-field="saveRestartBtn" data-i18n="settings.saveRestart"></button>
    </div>
  </div>`;

// One player on a list, created in listRow().
const LIST_ROW = `
  <li class="list-row">
    <span class="avatar" aria-hidden="true" data-field="initial"></span>
    <div class="list-row__main">
      <p class="list-row__title" data-field="name"></p>
      <p class="list-row__sub" data-field="details"></p>
    </div>
    <button class="btn btn--ghost" type="button" data-field="removeBtn"></button>
  </li>`;

/** @param {HTMLElement} root */
export function render(root) {
  root.append(view(VIEW));
  const f = fields(root);
  const form = f.form;

  // Shown while eula.txt is not true (AGENTS.md §6.5)
  const eula = eulaNotice();
  f.eulaSlot.replaceWith(eula.el);

  let alive = true; // false once the user navigated away (async results are dropped)
  /** @type {import('../api.js').Settings | null} last loaded or saved values */
  let saved = null;
  /** @type {import('../api.js').Status | null} */
  let status = null;
  let saving = false;
  let switching = false;
  let resetting = false;

  f.autoRestart.append(
    option('off', t('settings.autoRestartOff')),
    ...AUTO_RESTART_TIMES.map((time) => option(time, t('settings.autoRestartDaily', { time }))),
  );
  f.steps.append(
    ...SWITCH_STEPS.map((step) => {
      const li = document.createElement('li');
      li.className = 'steps__item';
      li.dataset.step = step;
      li.textContent = t(`settings.steps.${step}`);
      return li;
    }),
  );

  // ---------- Form: fill, read, compare, validate ----------

  /** Form controls that carry a value (inputs, selects, toggles), with their scope. */
  function controls() {
    return [...form.elements]
      .filter((el) => el.getAttribute('name'))
      .map((el) => ({ el, name: el.getAttribute('name'), scope: el.dataset.scope === 'panel' ? 'panel' : 'properties' }));
  }

  function readForm() {
    const values = { properties: {}, panel: {} };
    for (const { el, name, scope } of controls()) {
      if (el.localName === 'mc-toggle') values[scope][name] = el.checked;
      else if (el.type === 'number' || el.type === 'range') values[scope][name] = el.value === '' ? '' : Number(el.value);
      else values[scope][name] = el.value;
    }
    return values;
  }

  function fillForm(values) {
    for (const { el, name, scope } of controls()) {
      if (!(name in values[scope])) continue;
      const value = values[scope][name];
      if (el.localName === 'mc-toggle') {
        el.checked = Boolean(value);
        continue;
      }
      el.value = String(value);
      el.closest('mc-range')?.refresh();
      if (el.closest('mc-stepper')) el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    for (const field of form.querySelectorAll('mc-field')) field.error = '';
  }

  function isDirty() {
    if (!saved) return false;
    const current = readForm();
    return ['properties', 'panel'].some((scope) =>
      Object.entries(current[scope]).some(([name, value]) => saved[scope][name] !== value),
    );
  }

  /** Error text for one control, '' if valid. */
  function check(el) {
    if (el.disabled || el.localName === 'mc-toggle') return '';
    const value = el.value.trim();
    if (value === '') return el.required ? t('settings.errors.required') : '';
    if (el.type !== 'number') return '';
    const number = Number(value);
    if (!Number.isInteger(number)) return t('settings.errors.number');
    if (number < Number(el.min) || number > Number(el.max)) {
      return t('settings.errors.range', { min: el.min, max: el.max });
    }
    return '';
  }

  /** Marks every invalid field; returns the first invalid control or null. */
  function validate() {
    let first = null;
    for (const { el } of controls()) {
      const message = check(el);
      const field = el.closest('mc-field');
      if (field) field.error = message;
      if (message && !first) first = el;
    }
    return first;
  }

  // ---------- Save bar ----------

  /**
   * @param {'saved' | 'savedRestart' | 'unsaved' | 'invalid' | 'error' | ''} state
   * @param {string} [text]  for 'error': what went wrong
   */
  function setSaveStatus(state, text = '') {
    const keys = { saved: 'settings.saved', savedRestart: 'settings.savedRestart', unsaved: 'settings.unsaved', invalid: 'settings.invalid' };
    const error = state === 'invalid' || state === 'error';
    setStatusText(f.saveStatus, state === 'error' ? text : state ? t(keys[state]) : '', { error });
    f.saveStatus.dataset.state = state === 'unsaved' ? 'dirty' : state;
  }

  function updateSaveBar() {
    const dirty = isDirty();
    for (const button of [f.discardBtn, f.saveBtn, f.saveRestartBtn]) button.disabled = !dirty || saving;
    if (dirty && f.saveStatus.dataset.state !== 'invalid') setSaveStatus('unsaved');
    if (!dirty && f.saveStatus.dataset.state !== 'savedRestart') setSaveStatus(saved ? 'saved' : '');
  }

  form.addEventListener('input', (event) => {
    // Re-check a field that shows an error, so the message goes away once fixed
    const field = event.target.closest?.('mc-field');
    if (field?.error) field.error = check(event.target);
    if (f.saveStatus.dataset.state === 'invalid' && !hasErrors()) setSaveStatus('unsaved');
    updateSaveBar();
  });
  form.addEventListener('change', updateSaveBar);

  /** True while any field is still invalid (without marking them). */
  function hasErrors() {
    return controls().some(({ el }) => check(el) !== '');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (saving || !isDirty()) return;
    const restart = event.submitter?.value === 'restart';
    const invalid = validate();
    if (invalid) {
      setSaveStatus('invalid');
      invalid.focus();
      return;
    }
    saving = true;
    updateSaveBar();
    const next = readForm();
    try {
      await api.saveSettings(next, { restart });
    } catch (error) {
      if (!alive) return;
      // The changes stay in the form – saving again is one click
      saving = false;
      updateSaveBar();
      setSaveStatus('error', t('settings.saveFailed', { reason: errorText(error) }));
      if (document.activeElement === document.body) event.submitter?.focus();
      return;
    }
    if (!alive) return;
    saved = structuredClone(next);
    saving = false;
    setSaveStatus(restart ? 'saved' : 'savedRestart');
    updateSaveBar();
    updateListControls(); // the whitelist may have been switched on or off
  });

  f.discardBtn.addEventListener('click', () => {
    if (!saved) return;
    fillForm(saved);
    setSaveStatus('saved');
    updateSaveBar();
  });

  // Leaving the browser tab with unsaved changes asks first (the browser's own dialog) …
  function onBeforeUnload(event) {
    if (isDirty()) event.preventDefault();
  }
  window.addEventListener('beforeunload', onBeforeUnload);

  // … and so does going to another page of the panel
  const stopLeaveGuard = onBeforeLeave(
    () =>
      !isDirty() ||
      confirmDialog({
        title: t('settings.leaveDialog.title'),
        text: t('settings.leaveDialog.text'),
        confirmLabel: t('settings.leaveDialog.confirm'),
        danger: true,
      }),
  );

  // ---------- Player lists: apply at once, not part of the form (AGENTS.md §6.3) ----------

  /** @type {import('../api.js').Lists | null} */
  let lists = null;
  let listChanging = false;

  function selectedList() {
    return f.listTabs.querySelector('input:checked').value;
  }

  function renderList() {
    const list = selectedList();
    f.reasonField.hidden = list !== 'bans';
    f.addBtn.textContent = t(`settings.lists.add.${list}`);
    if (lists) {
      for (const count of f.listTabs.querySelectorAll('[data-count]')) {
        count.textContent = String(lists[count.dataset.count].length);
      }
      const entries = [...lists[list]].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      f.entries.replaceChildren(...entries.map((entry) => listRow(list, entry)));
      f.entries.hidden = entries.length === 0;
      f.entriesEmpty.hidden = entries.length > 0;
      f.entriesEmpty.textContent = t(`settings.lists.empty.${list}`);
    }
    updateListControls();
  }

  // While the server starts or stops, neither RCON nor the files are safe to use
  function updateListControls() {
    const busy = status?.state === 'starting' || status?.state === 'stopping';
    f.addBtn.disabled = busy || !lists;
    for (const button of f.entries.querySelectorAll('button')) button.disabled = busy;

    let note = '';
    if (busy) note = t('settings.lists.busy');
    else if (selectedList() === 'whitelist' && saved && !saved.properties['white-list']) note = t('settings.lists.whitelistOff');
    f.listNote.textContent = note;
    f.listNote.hidden = !note;
  }

  /** Error text for the name field, '' if it can be added. */
  function checkName(list, name) {
    if (!name) return t('settings.errors.required');
    if (!PLAYER_NAME.test(name)) return t('settings.lists.errors.name');
    if (lists[list].some((entry) => entry.name.toLowerCase() === name.toLowerCase())) {
      return t('settings.lists.errors.duplicate', { name });
    }
    return '';
  }

  /** @returns {Promise<boolean>} false if it did not work or the page is gone */
  async function changeList(list, action, name, reason = '') {
    listChanging = true;
    setStatusText(f.listError, '');
    try {
      await api.changeList(list, action, name, { reason });
      const next = await api.getLists();
      if (!alive) return false;
      lists = next;
    } catch (error) {
      if (alive) {
        setStatusText(f.listError, t(`settings.lists.failed.${action}`, { name, reason: errorText(error) }), { error: true });
      }
      return false;
    } finally {
      listChanging = false;
    }
    renderList();
    f.listStatus.textContent = t(`settings.lists.${action === 'add' ? 'added' : 'removed'}.${list}`, { name });
    return true;
  }

  f.listTabs.addEventListener('change', () => {
    f.nameField.error = '';
    setStatusText(f.listError, '');
    renderList();
  });

  f.listForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (listChanging || f.addBtn.disabled) return;
    const list = selectedList();
    const input = f.listForm.elements.player;
    const name = input.value.trim();
    const error = checkName(list, name);
    f.nameField.error = error;
    if (error) {
      input.focus();
      return;
    }
    const reason = list === 'bans' ? f.listForm.elements.reason.value.replace(/\s+/g, ' ').trim() : '';
    if (await changeList(list, 'add', name, reason)) {
      f.listForm.reset();
      input.focus();
    }
  });

  // A shown error goes away as soon as the name is fixed
  f.listForm.addEventListener('input', () => {
    setStatusText(f.listError, '');
    if (f.nameField.error) f.nameField.error = checkName(selectedList(), f.listForm.elements.player.value.trim());
  });

  f.entries.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-name]');
    if (!button || button.disabled || listChanging) return;
    const index = [...f.entries.children].indexOf(button.closest('li'));
    if (!(await changeList(selectedList(), 'remove', button.dataset.name))) return;
    // Carry on with the row that moved up, or the name field once the list is empty
    const next = f.entries.children[Math.min(index, f.entries.children.length - 1)];
    (next?.querySelector('button') ?? f.listForm.elements.player).focus();
  });

  renderList();

  // ---------- Server version ----------

  function selectedProvider() {
    return f.providers.querySelector('input:checked')?.value ?? null;
  }

  let versionsFailed = false;

  /** @param {boolean} [retry]  "Erneut versuchen" was pressed – focus goes to the list once it is there */
  async function loadVersions(retry = false) {
    const provider = selectedProvider();
    if (!provider) return;
    let list;
    try {
      list = await api.getVersions(provider, { snapshots: f.snapshots.checked });
    } catch (error) {
      if (!alive) return;
      // Without versions there is nothing to check – the check list would only guess
      versionsFailed = true;
      f.versionSelect.replaceChildren(option('', t('settings.versionsFailed')));
      f.checkList.hidden = true;
      showLoadError(f.versionsError, t('settings.versionsLoadFailed'), error, () => loadVersions(true));
      updateChecks();
      return;
    }
    if (!alive) return;
    if (versionsFailed) {
      versionsFailed = false;
      f.checkList.hidden = false;
      hideLoadError(f.versionsError);
    }
    list.sort((a, b) => compareVersions(b.id, a.id));

    const previous = f.versionSelect.value;
    const latest = list.find((v) => v.stable)?.id;
    f.versionSelect.replaceChildren(
      ...list.map((v) => option(v.id, v.id === latest ? t('settings.latest', { version: v.id }) : v.id)),
    );
    if (list.length === 0) f.versionSelect.append(option('', t('settings.noVersions')));
    const ids = list.map((v) => v.id);
    const preferred = [previous, provider === status?.provider ? status.version : null, latest];
    f.versionSelect.value = preferred.find((id) => id && ids.includes(id)) ?? ids[0] ?? '';
    updateChecks();
    if (retry) f.versionSelect.focus();
  }

  let lastChecks = '';

  function updateChecks() {
    if (!status) return;
    const target = { provider: selectedProvider(), version: f.versionSelect.value };
    /** @type {[string, string, (HTMLElement | null)?][]} */
    const items = [];

    const required = requiredJava(target.version);
    const javaOk = required !== null && status.java.includes(required);
    if (required === null) {
      items.push(['fail', t('settings.checks.javaUnknown')]);
    } else if (javaOk) {
      items.push(['ok', t('settings.checks.javaOk', { required, installed: required })]);
    } else {
      const installed = status.java.length ? status.java.map((v) => `Java ${v}`).join(', ') : t('common.none');
      items.push(['fail', t('settings.checks.javaMissing', { required, installed })]);
    }

    items.push(['ok', t('settings.checks.backup')]);
    if (!status.eulaAccepted) items.push(['fail', t('settings.checks.eula'), eulaLink()]);

    const same = target.provider === status.provider && target.version === status.version;
    if (same) items.push(['info', t('settings.checks.sameVersion')]);
    else if (compareVersions(target.version, status.version) < 0) items.push(['info', t('settings.checks.downgrade')]);

    const serverBusy = status.state === 'starting' || status.state === 'stopping';
    if (serverBusy && !switching) items.push(['info', t('settings.checks.busy')]);

    // Only touch the DOM when something changed – the list is a live region
    const key = items.map(([result, text]) => `${result}:${text}`).join('|');
    if (key !== lastChecks) {
      lastChecks = key;
      f.checks.replaceChildren(...items.map(([result, text, extra]) => checkItem(result, text, extra)));
    }

    f.switchBtn.disabled =
      !target.version || same || !javaOk || !status.eulaAccepted || serverBusy || switching || resetting;
  }

  /**
   * Marks steps before `active` as done; 'all' marks every step done, null clears.
   * failed: the switch stopped at `active`.
   */
  function setSteps(active, failed = false) {
    const index = active === 'all' ? SWITCH_STEPS.length : SWITCH_STEPS.indexOf(active);
    for (const [i, li] of [...f.steps.children].entries()) {
      li.dataset.state = active === null ? '' : i < index ? 'done' : i === index ? (failed ? 'failed' : 'active') : '';
      if (i === index && !failed) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    }
  }

  async function runSwitch() {
    const target = { provider: selectedProvider(), version: f.versionSelect.value };
    const downgrade = compareVersions(target.version, status.version) < 0;
    if (downgrade) {
      const ok = await confirmDialog({
        title: t('settings.downgradeDialog.title'),
        text: t('settings.downgradeDialog.text', { from: status.version, to: target.version }),
        confirmLabel: t('settings.downgradeDialog.confirm'),
        danger: true,
      });
      if (!ok || !alive) return;
    }

    switching = true;
    updateChecks();
    let current = null; // the step that is running
    let failure = '';
    try {
      await api.switchVersion({ ...target, confirmDowngrade: downgrade }, (step) => {
        if (!alive) return;
        current = step;
        setSteps(step);
        const number = SWITCH_STEPS.indexOf(step) + 1;
        setStatusText(f.switchStatus, `${t('settings.switching')} ${number}/${SWITCH_STEPS.length} · ${t(`settings.steps.${step}`)}`);
      });
    } catch (error) {
      failure = errorText(error);
    }
    if (!alive) return;
    switching = false;
    if (failure) {
      setSteps(current, true);
      setStatusText(f.switchStatus, t('settings.switchFailed', { reason: failure }), { error: true });
    } else {
      setSteps('all');
      setStatusText(f.switchStatus, t('settings.switched', { version: `${providerName(target.provider)} ${target.version}` }));
    }
    updateChecks();
    // The button was disabled while it ran; after a failure it is the way to try again
    if (failure && document.activeElement === document.body) f.switchBtn.focus();
  }

  f.providers.addEventListener('change', () => loadVersions());
  f.snapshots.addEventListener('change', () => loadVersions());
  f.versionSelect.addEventListener('change', updateChecks);
  f.switchBtn.addEventListener('click', runSwitch);

  // ---------- Danger zone ----------

  f.resetWorldBtn.addEventListener('click', async () => {
    const world = saved?.properties['level-name'] ?? 'world';
    const ok = await confirmDialog({
      title: t('settings.resetWorldDialog.title'),
      text: t('settings.resetWorldDialog.text', { world }),
      confirmLabel: t('settings.resetWorldDialog.confirm'),
      danger: true,
    });
    if (!ok || !alive) return;
    resetting = true;
    f.resetWorldBtn.disabled = true;
    setStatusText(f.resetWorldStatus, t('settings.resettingWorld'));
    updateChecks();
    let failure = '';
    try {
      await api.resetWorld();
    } catch (error) {
      failure = errorText(error);
    }
    if (!alive) return;
    resetting = false;
    f.resetWorldBtn.disabled = false;
    if (failure) setStatusText(f.resetWorldStatus, t('settings.resetWorldFailed', { reason: failure }), { error: true });
    else setStatusText(f.resetWorldStatus, t('settings.worldReset'));
    updateChecks();
    if (document.activeElement === document.body) f.resetWorldBtn.focus();
  });

  f.resetDefaultsBtn.addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: t('settings.resetDefaultsDialog.title'),
      text: t('settings.resetDefaultsDialog.text'),
      confirmLabel: t('settings.resetDefaultsDialog.confirm'),
      danger: true,
    });
    if (!ok || !alive) return;
    let defaults;
    try {
      defaults = await api.getDefaultProperties();
    } catch (error) {
      if (!alive) return;
      setSaveStatus('error', t('settings.defaultsFailed', { reason: errorText(error) }));
      f.saveStatus.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (!alive) return;
    fillForm({ properties: defaults, panel: readForm().panel });
    updateSaveBar();
    f.saveStatus.scrollIntoView({ block: 'nearest' });
  });

  // ---------- Jump links + highlight of the section in view ----------

  const sections = [...root.querySelectorAll('.page-anchor')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  f.sectionNav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-target]');
    if (!button) return;
    const section = root.querySelector(`#${button.dataset.target}`);
    section.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    section.querySelector('h2')?.focus({ preventScroll: true });
  });

  let spyFrame = 0;
  function markSectionInView() {
    spyFrame = 0;
    // The last section whose top has passed a line just below the top edge
    // (below the mobile top bar). At the very bottom the last sections can
    // never get there – take the last one.
    const line = SPY_LINE_PX;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    const current = atBottom
      ? sections.at(-1)
      : (sections.filter((s) => s.getBoundingClientRect().top <= line).at(-1) ?? sections[0]);
    for (const button of f.sectionNav.querySelectorAll('[data-target]')) {
      if (button.dataset.target === current.id) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }
  function onScroll() {
    spyFrame ||= requestAnimationFrame(markSectionInView);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  markSectionInView();

  // ---------- Data ----------

  const stopStatus = api.onStatus((next) => {
    const first = status === null;
    status = next;
    eula.update(next.eulaAccepted);
    const java = next.java.length ? ` · Java ${Math.max(...next.java)}` : '';
    f.installed.textContent = `${providerName(next.provider)} ${next.version}${java}`;
    // The port can only change while the server is stopped
    form.elements['server-port'].disabled = next.state !== 'offline';
    if (first) {
      const radio = f.providers.querySelector(`input[value="${next.provider}"]`);
      if (radio) radio.checked = true;
      loadVersions();
    }
    updateChecks();
    updateListControls();
  });

  // Until the values are there, the form is out of reach – typing would be overwritten
  /** @param {boolean} [retry]  "Erneut versuchen" was pressed – focus goes to the form once it is there */
  async function loadSettings(retry = false) {
    form.setAttribute('aria-busy', 'true');
    setStatusText(f.saveStatus, t('settings.loading'));
    let settings;
    try {
      settings = await api.getSettings();
    } catch (error) {
      if (!alive) return;
      form.removeAttribute('aria-busy');
      setSaveStatus('');
      showLoadError(f.formError, t('settings.loadFailed'), error, () => loadSettings(true));
      return;
    }
    if (!alive) return;
    hideLoadError(f.formError);
    saved = settings;
    fillForm(settings);
    form.inert = false;
    form.removeAttribute('aria-busy');
    setSaveStatus('saved');
    updateSaveBar();
    updateListControls();
    if (retry) root.querySelector('#settings-general-title')?.focus();
  }

  /** @param {boolean} [retry]  as in loadSettings() */
  async function loadLists(retry = false) {
    let next;
    try {
      next = await api.getLists();
    } catch (error) {
      if (!alive) return;
      f.entriesEmpty.hidden = true;
      showLoadError(f.listsError, t('settings.lists.loadFailed'), error, () => loadLists(true));
      return;
    }
    if (!alive) return;
    hideLoadError(f.listsError);
    lists = next;
    renderList();
    if (retry) f.listForm.elements.player.focus();
  }

  loadSettings();
  loadLists();

  return () => {
    alive = false;
    stopStatus();
    stopLeaveGuard();
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.removeEventListener('scroll', onScroll);
    cancelAnimationFrame(spyFrame);
  };
}

/** @param {string} value @param {string} label */
function option(value, label) {
  const el = document.createElement('option');
  el.value = value;
  el.textContent = label;
  return el;
}

/**
 * @param {keyof import('../api.js').Lists} list
 * @param {import('../api.js').ListEntry} entry
 */
function listRow(list, entry) {
  const fragment = view(LIST_ROW);
  const f = fields(fragment);
  f.initial.textContent = entry.name[0];
  f.name.textContent = entry.name;
  const details = [];
  if (entry.level) details.push(t('settings.lists.level', { level: entry.level }));
  if (entry.reason) details.push(entry.reason);
  if (entry.created) details.push(formatWhen(entry.created));
  f.details.textContent = details.join(' · ');
  f.details.hidden = details.length === 0;
  f.removeBtn.textContent = t(`settings.lists.remove.${list}`);
  f.removeBtn.setAttribute('aria-label', t(`settings.lists.removeLabel.${list}`, { name: entry.name }));
  f.removeBtn.dataset.name = entry.name;
  return fragment;
}

/** @param {string} result @param {string} text @param {HTMLElement | null} [extra] */
function checkItem(result, text, extra) {
  const li = document.createElement('li');
  li.className = 'check-list__item';
  li.dataset.result = result;
  const span = document.createElement('span');
  span.textContent = text;
  if (extra) span.append(' ', extra);
  li.append(span);
  return li;
}

function eulaLink() {
  const link = document.createElement('a');
  link.href = EULA_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = t('settings.checks.eulaLink');
  return link;
}
