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
import { providerName } from '../format.js';
import { t } from '../i18n/index.js';
import { compareVersions, requiredJava } from '../versions.js';
import { fields, view } from './view.js';

export const titleKey = 'nav.settings';

const AUTO_RESTART_TIMES = ['03:00', '04:00', '05:00', '06:00'];
const SWITCH_STEPS = ['stop', 'backup', 'download', 'swap', 'start'];
const EULA_URL = 'https://aka.ms/MinecraftEULA';
const SPY_LINE_PX = 120; // section counts as "in view" once its top passes this line

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

    <nav class="choice-chips" data-i18n-label="settings.sectionsLabel" data-field="sectionNav">
      <button class="choice-chip" type="button" data-target="settings-general" data-i18n="settings.sections.general"></button>
      <button class="choice-chip" type="button" data-target="settings-world" data-i18n="settings.sections.world"></button>
      <button class="choice-chip" type="button" data-target="settings-players" data-i18n="settings.sections.players"></button>
      <button class="choice-chip" type="button" data-target="settings-performance" data-i18n="settings.sections.performance"></button>
      <button class="choice-chip" type="button" data-target="settings-version" data-i18n="settings.sections.version"></button>
      <button class="choice-chip" type="button" data-target="settings-danger" data-i18n="settings.sections.danger"></button>
    </nav>

    <form class="page__narrow" id="settings-form" novalidate data-field="form">
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
              <select class="input input--mono" data-field="versionSelect"></select>
            </div>
          </mc-field>
          <label class="checkbox">
            <input type="checkbox" data-field="snapshots">
            <span data-i18n="settings.snapshots"></span>
          </label>
        </div>

        <div class="check-list" aria-live="polite">
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

/** @param {HTMLElement} root */
export function render(root) {
  root.append(view(VIEW));
  const f = fields(root);
  const form = f.form;

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

  /** @param {'saved' | 'savedRestart' | 'unsaved' | 'invalid' | ''} state */
  function setSaveStatus(state) {
    const keys = { saved: 'settings.saved', savedRestart: 'settings.savedRestart', unsaved: 'settings.unsaved', invalid: 'settings.invalid' };
    f.saveStatus.textContent = state ? t(keys[state]) : '';
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
    await api.saveSettings(next, { restart });
    if (!alive) return;
    saved = structuredClone(next);
    saving = false;
    setSaveStatus(restart ? 'saved' : 'savedRestart');
    updateSaveBar();
  });

  f.discardBtn.addEventListener('click', () => {
    if (!saved) return;
    fillForm(saved);
    setSaveStatus('saved');
    updateSaveBar();
  });

  // Leaving the browser tab with unsaved changes asks first
  function onBeforeUnload(event) {
    if (isDirty()) event.preventDefault();
  }
  window.addEventListener('beforeunload', onBeforeUnload);

  // ---------- Server version ----------

  function selectedProvider() {
    return f.providers.querySelector('input:checked')?.value ?? null;
  }

  async function loadVersions() {
    const provider = selectedProvider();
    if (!provider) return;
    const list = await api.getVersions(provider, { snapshots: f.snapshots.checked });
    if (!alive) return;
    list.sort((a, b) => compareVersions(b.id, a.id));

    const previous = f.versionSelect.value;
    const latest = list.find((v) => v.stable)?.id;
    f.versionSelect.replaceChildren(
      ...list.map((v) => option(v.id, v.id === latest ? t('settings.latest', { version: v.id }) : v.id)),
    );
    const ids = list.map((v) => v.id);
    const preferred = [previous, provider === status?.provider ? status.version : null, latest];
    f.versionSelect.value = preferred.find((id) => id && ids.includes(id)) ?? ids[0] ?? '';
    updateChecks();
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

  /** Marks steps before `active` as done; 'all' marks every step done, null clears. */
  function setSteps(active) {
    const index = active === 'all' ? SWITCH_STEPS.length : SWITCH_STEPS.indexOf(active);
    for (const [i, li] of [...f.steps.children].entries()) {
      li.dataset.state = active === null ? '' : i < index ? 'done' : i === index ? 'active' : '';
      if (i === index) li.setAttribute('aria-current', 'step');
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
    await api.switchVersion({ ...target, confirmDowngrade: downgrade }, (step) => {
      if (!alive) return;
      setSteps(step);
      const number = SWITCH_STEPS.indexOf(step) + 1;
      f.switchStatus.textContent = `${t('settings.switching')} ${number}/${SWITCH_STEPS.length} · ${t(`settings.steps.${step}`)}`;
    });
    if (!alive) return;
    switching = false;
    setSteps('all');
    f.switchStatus.textContent = t('settings.switched', { version: `${providerName(target.provider)} ${target.version}` });
    updateChecks();
  }

  f.providers.addEventListener('change', loadVersions);
  f.snapshots.addEventListener('change', loadVersions);
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
    f.resetWorldStatus.textContent = t('settings.resettingWorld');
    updateChecks();
    await api.resetWorld();
    if (!alive) return;
    resetting = false;
    f.resetWorldBtn.disabled = false;
    f.resetWorldStatus.textContent = t('settings.worldReset');
    updateChecks();
  });

  f.resetDefaultsBtn.addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: t('settings.resetDefaultsDialog.title'),
      text: t('settings.resetDefaultsDialog.text'),
      confirmLabel: t('settings.resetDefaultsDialog.confirm'),
      danger: true,
    });
    if (!ok || !alive) return;
    const defaults = await api.getDefaultProperties();
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
  });

  api.getSettings().then((settings) => {
    if (!alive) return;
    saved = settings;
    fillForm(settings);
    setSaveStatus('saved');
    updateSaveBar();
  });

  return () => {
    alive = false;
    stopStatus();
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
