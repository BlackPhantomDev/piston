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

// The Web Components in public/js/components/. Texts are compared with t(),
// so the tests pass in every UI language.

import '../../public/js/components/index.js';
import { LOCALES, locale, t } from '../../public/js/i18n/index.js';
import { assert, deepEqual, equal, group, test, tick } from './runner.js';

/** @param {Element} el @param {string} key */
const key = (el, key) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

group('piston-stepper', () => {
  test('adds − and + buttons with labels, outside the tab order', ({ mount }) => {
    const root = mount('<piston-stepper><input type="number" min="1" max="3" value="2"></piston-stepper>');
    const [minus, plus] = root.querySelectorAll('button');
    equal(minus.getAttribute('aria-label'), t('stepper.decrease'), '− label');
    equal(plus.getAttribute('aria-label'), t('stepper.increase'), '+ label');
    equal(minus.tabIndex, -1, '− tabindex');
    equal(plus.tabIndex, -1, '+ tabindex');
  });

  test('+ and − step the input and fire input and change', ({ mount }) => {
    const root = mount('<piston-stepper><input type="number" min="1" max="5" value="2"></piston-stepper>');
    const input = root.querySelector('input');
    const [minus, plus] = root.querySelectorAll('button');
    const events = [];
    input.addEventListener('input', () => events.push('input'));
    input.addEventListener('change', () => events.push('change'));
    plus.click();
    equal(input.value, '3', 'after +');
    minus.click();
    minus.click();
    equal(input.value, '1', 'after − −');
    deepEqual(events, ['input', 'change', 'input', 'change', 'input', 'change'], 'events');
  });

  test('disables − at min and + at max', ({ mount }) => {
    const root = mount('<piston-stepper><input type="number" min="1" max="2" value="1"></piston-stepper>');
    const [minus, plus] = root.querySelectorAll('button');
    assert(minus.disabled && !plus.disabled, 'at min: − disabled, + enabled');
    plus.click();
    assert(!minus.disabled && plus.disabled, 'at max: − enabled, + disabled');
  });

  test('a disabled input disables both buttons', ({ mount }) => {
    const root = mount('<piston-stepper><input type="number" min="1" max="9" value="5" disabled></piston-stepper>');
    assert([...root.querySelectorAll('button')].every((b) => b.disabled), 'both disabled');
  });
});

group('piston-toggle', () => {
  test('renders a labelled switch that mirrors "checked"', ({ mount }) => {
    const root = mount('<piston-toggle checked>PvP</piston-toggle>');
    const toggle = root.querySelector('piston-toggle');
    const sw = root.querySelector('[role="switch"]');
    equal(sw.getAttribute('aria-checked'), 'true', 'aria-checked');
    equal(document.getElementById(sw.getAttribute('aria-labelledby'))?.textContent, 'PvP', 'label');
    toggle.checked = false;
    equal(sw.getAttribute('aria-checked'), 'false', 'aria-checked after checked = false');
  });

  test('a click toggles and fires change', ({ mount }) => {
    const root = mount('<piston-toggle>PvP</piston-toggle>');
    const toggle = root.querySelector('piston-toggle');
    let changes = 0;
    toggle.addEventListener('change', () => changes++);
    root.querySelector('[role="switch"]').click();
    assert(toggle.checked, 'checked after click');
    equal(changes, 1, 'change events');
  });

  test('the description is linked with aria-describedby', ({ mount }) => {
    const root = mount('<piston-toggle description="Players can fight">PvP</piston-toggle>');
    const sw = root.querySelector('[role="switch"]');
    equal(document.getElementById(sw.getAttribute('aria-describedby'))?.textContent, 'Players can fight', 'description');
  });

  test('takes part in forms: value when checked, nothing when not', ({ mount }) => {
    const root = mount('<form><piston-toggle name="pvp" checked>PvP</piston-toggle><piston-toggle name="hardcore">Hardcore</piston-toggle></form>');
    const data = new FormData(root.querySelector('form'));
    equal(data.get('pvp'), 'on', 'checked toggle');
    equal(data.get('hardcore'), null, 'unchecked toggle');
  });

  test('disabled itself or by a disabled fieldset', async ({ mount }) => {
    const root = mount('<piston-toggle disabled>A</piston-toggle><fieldset disabled><piston-toggle>B</piston-toggle></fieldset>');
    await tick();
    const [a, b] = root.querySelectorAll('[role="switch"]');
    assert(a.disabled, 'disabled attribute');
    assert(b.disabled, 'disabled fieldset');
  });

  test('a fieldset disabled later wins over attribute changes', async ({ mount }) => {
    const root = mount('<fieldset><piston-toggle>A</piston-toggle></fieldset>');
    const fieldset = root.querySelector('fieldset');
    const sw = root.querySelector('[role="switch"]');
    fieldset.disabled = true;
    await tick();
    root.querySelector('piston-toggle').checked = true;
    assert(sw.disabled, 'still disabled after "checked" changed');
    fieldset.disabled = false;
    await tick();
    assert(!sw.disabled, 'enabled again');
  });
});

group('piston-field', () => {
  test('wires label and help text to the control', ({ mount }) => {
    const root = mount('<piston-field label="Port" help="1–65535"><input class="input"></piston-field>');
    const input = root.querySelector('input');
    const label = root.querySelector('label');
    equal(label.htmlFor, input.id, 'label for');
    equal(label.textContent, 'Port', 'label text');
    equal(document.getElementById(input.getAttribute('aria-describedby'))?.textContent, '1–65535', 'described by help');
  });

  test('an error replaces the help text: icon, text, aria-invalid', ({ mount }) => {
    const root = mount('<piston-field label="Port" help="1–65535"><input class="input"></piston-field>');
    const field = root.querySelector('piston-field');
    const input = root.querySelector('input');
    field.error = 'Too big';
    const error = document.getElementById(input.getAttribute('aria-describedby'));
    equal(input.getAttribute('aria-invalid'), 'true', 'aria-invalid');
    equal(error?.textContent, 'Too big', 'described by the error');
    assert(error && !error.hidden && error.querySelector('svg'), 'error visible, with icon');
    assert(root.querySelector('.field__help').hidden, 'help hidden');
    field.error = '';
    assert(!input.hasAttribute('aria-invalid'), 'aria-invalid gone');
    equal(document.getElementById(input.getAttribute('aria-describedby'))?.textContent, '1–65535', 'help again');
  });

  test('starts with the error attribute', ({ mount }) => {
    const root = mount('<piston-field label="Port" error="Required"><input class="input"></piston-field>');
    equal(root.querySelector('piston-field').error, 'Required', 'error');
    equal(root.querySelector('input').getAttribute('aria-invalid'), 'true', 'aria-invalid');
  });

  test('keeps its own <label>', ({ mount }) => {
    const root = mount('<piston-field><label>Distance <output>10</output></label><input type="range"></piston-field>');
    equal(root.querySelectorAll('label').length, 1, 'labels');
    equal(root.querySelector('label').htmlFor, root.querySelector('input').id, 'label for');
  });
});

group('piston-range', () => {
  test('fills the track and mirrors the value into <output>', ({ mount }) => {
    const root = mount('<piston-range><input type="range" id="test-range" min="0" max="10" value="5"></piston-range><output for="test-range"></output>');
    const input = root.querySelector('input');
    const output = root.querySelector('output');
    equal(input.style.getPropertyValue('--range-fill'), '50%', 'fill at start');
    equal(output.value, '5', 'output at start');
    input.value = '10';
    input.dispatchEvent(new Event('input'));
    equal(input.style.getPropertyValue('--range-fill'), '100%', 'fill after input');
    equal(output.value, '10', 'output after input');
  });

  test('refresh() after setting the value from code', ({ mount }) => {
    const root = mount('<piston-range><input type="range" min="2" max="6" value="2"></piston-range>');
    const input = root.querySelector('input');
    input.value = '4';
    root.querySelector('piston-range').refresh();
    equal(input.style.getPropertyValue('--range-fill'), '50%', 'fill');
  });
});

group('piston-status-badge', () => {
  test('every state with text and a hidden marker, role="status"', ({ mount }) => {
    for (const state of ['loading', 'online', 'offline', 'starting', 'stopping']) {
      const badge = mount(`<piston-status-badge status="${state}"></piston-status-badge>`).firstElementChild;
      equal(badge.getAttribute('role'), 'status', `${state}: role`);
      equal(badge.dataset.state, state, `${state}: data-state`);
      equal(badge.textContent, t(`status.${state}`), `${state}: text`);
      equal(badge.querySelector('.status-badge__marker')?.getAttribute('aria-hidden'), 'true', `${state}: marker hidden`);
    }
  });

  test('no or an unknown status shows "loading", never a guessed "offline"', ({ mount }) => {
    const root = mount('<piston-status-badge></piston-status-badge><piston-status-badge status="exploded"></piston-status-badge>');
    for (const badge of root.children) equal(/** @type {HTMLElement} */ (badge).dataset.state, 'loading', 'state');
  });

  test('the same status again does not render anew', ({ mount }) => {
    const badge = mount('<piston-status-badge status="online"></piston-status-badge>').firstElementChild;
    const marker = badge.querySelector('.status-badge__marker');
    badge.setAttribute('status', 'online');
    assert(badge.querySelector('.status-badge__marker') === marker, 'same marker element');
    badge.setAttribute('status', 'offline');
    assert(badge.querySelector('.status-badge__marker') !== marker, 'new marker on a new state');
  });
});

group('piston-action-menu', () => {
  const MENU = `<piston-action-menu label="Actions for Steve">
      <button value="tell">Tell</button>
      <button value="op" hidden>Op</button>
      <button value="deop" disabled>Deop</button>
      <hr>
      <button value="kick">Kick</button>
      <button value="ban">Ban</button>
    </piston-action-menu>`;
  const parts = (/** @type {HTMLElement} */ root) => ({
    trigger: /** @type {HTMLButtonElement} */ (root.querySelector('[aria-haspopup="menu"]')),
    menu: /** @type {HTMLElement} */ (root.querySelector('[role="menu"]')),
    item: (/** @type {string} */ value) => /** @type {HTMLElement} */ (root.querySelector(`[role="menuitem"][value="${value}"]`)),
  });

  test('menu button pattern: labels, roles, items outside the tab order', ({ mount }) => {
    const { trigger, menu, item } = parts(mount(MENU));
    equal(trigger.getAttribute('aria-label'), 'Actions for Steve', 'button label');
    equal(menu.getAttribute('aria-label'), 'Actions for Steve', 'menu label');
    equal(trigger.getAttribute('aria-expanded'), 'false', 'collapsed');
    equal(menu.querySelectorAll('[role="menuitem"]').length, 5, 'menu items');
    equal(item('tell').tabIndex, -1, 'item tabindex');
    assert(menu.querySelector('hr.menu__separator'), 'separator');
  });

  test('opens on click, focus on the first entry', async ({ mount }) => {
    const { trigger, item } = parts(mount(MENU));
    trigger.click();
    await tick();
    equal(trigger.getAttribute('aria-expanded'), 'true', 'expanded');
    assert(document.activeElement === item('tell'), 'focus on the first entry');
  });

  test('arrow keys, Home and End skip hidden and disabled entries', async ({ mount }) => {
    const { trigger, menu, item } = parts(mount(MENU));
    trigger.click();
    await tick();
    const focused = () => /** @type {HTMLButtonElement} */ (document.activeElement).value;
    key(menu, 'ArrowDown');
    equal(focused(), 'kick', 'ArrowDown skips hidden "op" and disabled "deop"');
    key(menu, 'End');
    equal(focused(), 'ban', 'End');
    key(menu, 'ArrowDown');
    equal(focused(), 'tell', 'ArrowDown wraps to the start');
    key(menu, 'ArrowUp');
    equal(focused(), 'ban', 'ArrowUp wraps to the end');
    key(menu, 'Home');
    equal(focused(), 'tell', 'Home');
    assert(item('tell'), 'items stay');
  });

  test('ArrowUp on the button opens with focus on the last entry', async ({ mount }) => {
    const { trigger } = parts(mount(MENU));
    trigger.focus();
    key(trigger, 'ArrowUp');
    await tick();
    equal(/** @type {HTMLButtonElement} */ (document.activeElement).value, 'ban', 'focus on the last entry');
  });

  test('choosing an entry fires "action", closes and focuses the button', async ({ mount }) => {
    const root = mount(MENU);
    const { trigger, item } = parts(root);
    const chosen = [];
    root.addEventListener('action', (event) => chosen.push(/** @type {CustomEvent} */ (event).detail.value));
    trigger.click();
    await tick();
    item('kick').click();
    await tick();
    deepEqual(chosen, ['kick'], 'action values');
    equal(trigger.getAttribute('aria-expanded'), 'false', 'collapsed');
    assert(document.activeElement === trigger, 'focus back on the button');
  });

  test('closing returns focus to the button', async ({ mount }) => {
    const { trigger, menu } = parts(mount(MENU));
    trigger.click();
    await tick();
    menu.hidePopover(); // what Escape and a click outside do
    await tick();
    assert(document.activeElement === trigger, 'focus on the button');
  });

  test('a new label reaches button and menu', ({ mount }) => {
    const root = mount(MENU);
    root.firstElementChild.setAttribute('label', 'Actions for Alex');
    const { trigger, menu } = parts(root);
    equal(trigger.getAttribute('aria-label'), 'Actions for Alex', 'button');
    equal(menu.getAttribute('aria-label'), 'Actions for Alex', 'menu');
  });
});

group('piston-log-view', () => {
  const LINES = [
    { time: '10:00:00', level: 'INFO', text: 'Done (3.2s)!' },
    { time: '10:00:01', level: 'WARN', text: "Can't keep up!" },
    { time: '10:00:02', level: 'ERROR', text: 'Failed to save chunk' },
    { time: '10:00:03', level: 'INFO', text: '<Alex> hello there' },
  ];

  test('one line per entry, level as modifier, the chat sender highlighted', ({ mount }) => {
    const view = mount('<piston-log-view></piston-log-view>').firstElementChild;
    view.add(LINES);
    const items = [...view.querySelectorAll('li')];
    deepEqual(items.map((li) => li.className.split('--')[1]), ['info', 'warn', 'error', 'info'], 'modifiers');
    equal(items[3].querySelector('.log__player')?.textContent, '<Alex>', 'chat sender');
    equal(view.toText().split('\n')[1], "[10:00:01] [WARN]: Can't keep up!", 'raw text');
  });

  test('log text is text, never markup', ({ mount }) => {
    const view = mount('<piston-log-view></piston-log-view>').firstElementChild;
    view.add([{ time: '10:00:00', level: 'INFO', text: '<img src=x onerror="window.injected = true">' }]);
    assert(!view.querySelector('img'), 'no element from the text');
    assert(!window.injected, 'nothing ran');
  });

  test('keeps the newest lines up to "limit"', ({ mount }) => {
    const view = mount('<piston-log-view limit="2"></piston-log-view>').firstElementChild;
    view.add(LINES);
    equal(view.lineCount, 2, 'lines kept');
    assert(view.toText().includes('<Alex>'), 'newest line kept');
  });

  test('search and level filter change what is visible', ({ mount }) => {
    const view = mount('<piston-log-view></piston-log-view>').firstElementChild;
    view.add(LINES);
    view.query = 'CHUNK';
    equal(view.visibleCount, 1, 'search ignores case');
    view.query = '';
    view.setAttribute('filter', 'warn');
    equal(view.visibleCount, 1, 'level filter');
    view.clear();
    equal(view.lineCount, 0, 'clear');
  });

  test('"live" makes it a log for screen readers', ({ mount }) => {
    const view = mount('<piston-log-view live aria-label="Console"></piston-log-view>').firstElementChild;
    equal(view.getAttribute('role'), 'log', 'role');
    equal(view.querySelector('ol')?.getAttribute('role'), null, 'the list keeps its list role');
  });
});

group('piston-lang-switch', () => {
  test('one radio per language, the active one checked, names in their own language', ({ mount }) => {
    const root = mount('<piston-lang-switch></piston-lang-switch>');
    const fieldset = root.querySelector('fieldset');
    equal(fieldset.getAttribute('aria-label'), t('lang.label'), 'group name');
    const radios = [...root.querySelectorAll('input[type="radio"]')];
    deepEqual(radios.map((r) => r.value), LOCALES.map((l) => l.code), 'radios');
    equal(radios.find((r) => r.checked)?.value, locale, 'checked');
    for (const { code, name, strings } of LOCALES) {
      const label = radios.find((r) => r.value === code).closest('label');
      equal(label.querySelector(`[lang="${code}"]`)?.textContent, name, `${code}: endonym`);
      equal(radios.find((r) => r.value === code).disabled, !strings, `${code}: disabled only without strings`);
    }
  });
});

// axe skips disabled controls (WCAG 1.4.3 exempts them), so their text is checked here:
// still 4.5:1, and never faded with opacity – a disabled action card tells why ("Server offline").

/** @param {string} css "rgb(r, g, b)" or "rgba(r, g, b, a)" */
const rgba = (css) => {
  const [r, g, b, a = 1] = /** @type {number[]} */ (css.match(/[\d.]+/g)?.map(Number));
  return { r, g, b, a };
};

/** @param {{ r: number, g: number, b: number }} c */
const luminance = ({ r, g, b }) => {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

/** Background behind an element: its own and its ancestors' layers, blended until opaque. @param {Element} el */
function backgroundOf(el) {
  const layers = [];
  for (let node = /** @type {Element | null} */ (el); node; node = node.parentElement) {
    const bg = rgba(getComputedStyle(node).backgroundColor);
    if (bg.a > 0) layers.push(bg);
    if (bg.a === 1) break;
  }
  let color = { r: 0, g: 0, b: 0 };
  for (const { r, g, b, a } of layers.reverse()) {
    color = { r: r * a + color.r * (1 - a), g: g * a + color.g * (1 - a), b: b * a + color.b * (1 - a) };
  }
  return color;
}

/** @param {Element} el */
function contrast(el) {
  const [hi, lo] = [luminance(rgba(getComputedStyle(el).color)), luminance(backgroundOf(el))].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

group('disabled controls', () => {
  test('text stays readable: 4.5:1 or more, no opacity', ({ mount }) => {
    const root = mount(`
      <div class="card">
        <button class="btn btn--primary" disabled>Primary</button>
        <button class="btn btn--secondary" disabled>Secondary</button>
        <button class="btn btn--ghost" disabled>Ghost</button>
        <button class="btn btn--danger" disabled>Danger</button>
        <button class="chip" type="button" disabled>say</button>
        <label class="checkbox"><input type="checkbox" disabled> Checkbox</label>
        <label class="checkbox"><input type="checkbox" checked disabled> Checked</label>
        <piston-toggle disabled>Toggle</piston-toggle>
        <input class="input" value="25565" aria-label="Port" disabled>
        <label class="option-card">
          <input type="radio" name="provider" disabled>
          <span class="option-card__title">Forge</span>
          <span class="option-card__sub">Planned</span>
        </label>
        <button class="action-card" type="button" disabled>
          <span class="action-card__icon"></span>
          <span class="action-card__text">
            <span class="action-card__title">Tag setzen</span>
            <span class="action-card__sub">Server offline</span>
          </span>
        </button>
      </div>`);
    const texts = root.querySelectorAll(
      '.btn, .chip, .checkbox, .toggle__label, .input, .option-card__title, .option-card__sub, .action-card__title, .action-card__sub',
    );
    equal(texts.length, 13, 'texts checked');
    for (const el of texts) {
      const name = `${el.className.split(' ')[0]} "${(el.textContent || /** @type {HTMLInputElement} */ (el).value).trim()}"`;
      for (let node = /** @type {Element | null} */ (el); node && node !== root; node = node.parentElement) {
        equal(getComputedStyle(node).opacity, '1', `${name}: opacity of ${node.className.split(' ')[0] || node.localName}`);
      }
      const ratio = contrast(el);
      assert(ratio >= 4.5, `${name}: contrast ${ratio.toFixed(2)}:1, needs 4.5:1`);
    }
  });
});
