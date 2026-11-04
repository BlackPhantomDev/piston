# Changelog

All notable changes to PiSton are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [Semantic Versioning](https://semver.org/).
Versions below 1.0.0 are in development – anything may still change.

## [Unreleased]

### Changed

- "Powered by PiSton" now links to the project website, [pistonpanel.dev](https://pistonpanel.dev);
  "Quellcode" still leads to the repository. The frontend tests check both links on every page.
- README: link to the website below the tagline.

### Fixed

- Disabled controls are readable again: checkboxes, command chips, action cards, the language switch and
  primary/danger buttons were faded with opacity, down to 2.6:1. They now use the muted text colour like
  disabled toggles and inputs (5:1 or more), so "Server offline" on a disabled action card can be read.
  A new frontend test checks this, since axe skips disabled elements.

## [0.1.0-alpha.7] – 2026-10-30

English UI and frontend tests in the browser – plus a tidier repo: only the fonts in use, one prefix for all elements.

### Added

- Frontend tests that run in the browser, without Node.js: `tests/frontend/` checks every component, both UI
  languages and the pages on sample data, including axe-core at desktop and phone width.
- English UI: switch with DE | EN. Backend errors arrive in German and are looked up by their code;
  dates and times follow the browser's regional variant (en-GB, en-US, …).
- Home: below the TPS value, the target and how it runs – "Ziel 20 · flüssig", "etwas verzögert" below 19,
  "stark verzögert" below 15. Without a value (offline, still loading) just "Ziel 20".

### Changed

- Phones: the language switch sits in the top bar, right of the logo – the sidebar no longer has to be opened for it.
- Home shows the server name in its status line: "Survival-Welt · Vanilla 26.3 · läuft seit …" in one line on
  wide screens (a long name is cut with "…"), and on its own line above on phones.
- All custom elements share the `piston-` prefix: `<piston-field>`, `<piston-toggle>`, `<piston-status-badge>`, …
  (before: `mc-…` mixed with names without a prefix). `css/style.css` is now `css/base.css`.
- `.gitignore` is part of the repository, so `*.jar`, `.venv/` and `dist/` stay out of fresh clones too.
  The README explains that PiSton is developed with AI assistance.

### Fixed

- A `<piston-toggle>` inside a disabled `<fieldset>` could still be switched.

### Removed

- Unused font files: the static and italic cuts and every Chakra Petch weight but Bold – 23 MB down to 1.2 MB.

## [0.1.0-alpha.6] – 2026-10-30

The frontend is complete: error messages, the EULA in the panel – and a demo that stays in the repo.

### Added

- Confirming the Minecraft EULA in the panel: while `eula.txt` does not say `eula=true`, Home and Settings show
  a card with a link to the EULA, a checkbox that is never ticked in advance and an "Akzeptieren" button.
  Starting the server stays locked until then. Try it in the demo with `?sim=eula`.
- `scripts/build_dist.py` builds the demo into `dist/` – the panel on sample data, ready for any static
  web host, `?sim=lost` included. Only Python's standard library is needed.
- Error messages: when the backend answers `{ error: { code, message } }`, the panel shows the message
  where the action happened – in the save bar, below the version steps, under the player lists, in the
  message dialog or as a console line. Actions without a place of their own (start/stop, backup, player
  menu) show a notice at the bottom right that stays until it is closed. Settings, player lists and
  versions that do not load get "Erneut versuchen". Try it in the demo with `?sim=error`.

### Changed

- A checkbox whose label wraps to two lines keeps its square box.
- Demo: adding `?sim=…` behind the `#` of an open panel now reloads it, so the simulation starts right away.
- The status badge pulses with a ring around it when the state changes: calmly for online, faster for
  offline – for just under 5 seconds, then it rests. While the server starts or stops, it pulses until done.
  It stays still when the system asks for reduced motion.
- The component overview (`components.html`) shows every building block again, including the new ones:
  choice chips, option cards, check list and steps, action menu, dialog, copy button with tooltip,
  error messages and the parts of the "Das Gerät antwortet nicht" screen.
- The demo stays in the repo for good: `js/api.js` is now the contract and picks the implementation,
  the sample-data version lives in `js/api/demo.js`. The live backend will come as `js/api/live.js`.

## [0.1.0-alpha.5] – 2026-10-29

Polish: connection and loading states, accessibility – and the backend will be Python.

### Added

- When the panel loses its connection to the device: a short banner first, after 10 seconds a screen
  ("Das Gerät antwortet nicht") with countdown, retry button and things to check, then
  "Verbindung wiederhergestellt". The page underneath stays as it was, unsaved settings included.
  Try it with `index.html?sim=lost` or `#/home?sim=lost`.
- Loading states: "Lädt …" until the first data arrives – status badge, values, lists, console and settings.
- Empty console: "Noch keine Ausgabe." or "Keine Zeile passt zu Filter oder Suche."
- "Zum Inhalt springen" (skip to content) link as the first tab stop.
- Windows high contrast mode: selected chips, language, provider, current page and toggles stay visible.

### Fixed

- Home shows "–" for RAM and CPU while the server is offline instead of 0.
- Before the first status, the badge no longer guesses "Offline".
- Accessibility: no axe-core violations left (WCAG 2.2 AA) on any page or state.
  - Console lines are announced as a list again: `role="log"` moved from the list to `<log-view>`.
  - The language switch has a name for screen readers.
  - Placeholder text has enough contrast (5:1).
  - Finished steps of a version switch show a tick, not only green.
  - Inputs show their focus in high contrast mode too.

### Changed

- The backend will be written in **Python 3.11+** (`asyncio` with `aiohttp`) instead of Node.js.
  On the Pi, PiSton then needs only Python and Java.
- `pyproject.toml` replaces `package.json` as the source of the version, in PEP 440 form (`0.1.0a5`);
  `public/js/version.js` keeps the SemVer form (`0.1.0-alpha.5`).
- README: Python requirements and virtual environment, how to reach the panel
  (IP or `raspberrypi.local`, fixed IP via DHCP reservation), plain HTTP by design.

## [0.1.0-alpha.4] – 2026-10-28

First polish: small phone screens and a copy button.

### Added

- Copy button for the server address in the sidebar, with a tooltip and a confirmation.
  It also works on plain HTTP in the LAN, where browsers block the modern clipboard API.

### Fixed

- The settings page no longer gets wider than small phone screens (320 px),
  and the save bar fits there.
- The page behind the open sidebar no longer scrolls on narrow screens.

## [0.1.0-alpha.3] – 2026-10-28

All three pages are complete, still on sample data.

### Added

- Player menu on the home page: send a private message, give or take operator rights,
  kick and ban (both ask first). Works with mouse and keyboard.
- Server name and address in the sidebar, an "online" count on the player list
  and a note instead of an empty list.
- Player lists in the settings: whitelist, operators and bans – add and remove players,
  ban with a reason. Changes apply at once, without saving.
- Leaving the settings with unsaved changes asks first – for links inside the panel
  and for the browser's back and forward buttons.
- The sample data reacts like a vanilla server to `op`, `deop`, `ban`, `pardon`,
  `whitelist`, `kick` and `tell` – on the console page, too.
- README: the EULA is never accepted for you, and no `server.jar` is ever shipped.

### Changed

- New logo: a cylindrical piston with π on its head, plus a light variant for light backgrounds.
  The README shows the matching one for GitHub's light and dark mode.

## [0.1.0-alpha.2] – 2026-10-28

Still frontend only, on sample data.

### Added

- Settings page: all main `server.properties` values in sections (general, world,
  players & rules, performance & network) with jump links, checks in the browser
  and a save bar (discard / save / save & restart).
- Server version: provider cards (Vanilla, Paper, Fabric; Forge / NeoForge shown as planned),
  version list for the old and the new numbering, optional snapshots.
- Checks before a version switch: required Java, automatic backup, same version,
  downgrade, accepted EULA – then a step-by-step switch with confirmation for downgrades.
- Danger zone: reset the world, reset settings to defaults – both ask first.

### Changed

- The "Powered by PiSton" attribution and the version sit at the bottom of the sidebar
  on wide screens, so they are always in view; narrow screens keep the footer.
- Server address moved to the top of the sidebar.

## [0.1.0-alpha.1] – 2026-10-28

First tagged state: the frontend runs on sample data, there is no backend yet.

### Added

- Design system: tokens, local fonts, base styles and components
  (buttons, inputs, toggles, cards, stat and action cards, dialog, chips).
- App shell with sidebar, hash routing (`#/home`, `#/console`, `#/settings`)
  and a sliding sidebar on narrow screens.
- Home page: server and system monitoring, player list, console preview,
  start / stop / restart and quick actions.
- Console page: live log with level filter, search, auto-scroll,
  command line with history and common commands.
- Language switch prepared (German active, English planned).
- Required "Powered by PiSton" attribution on every page (AGPL-3.0 §7).

[Unreleased]: https://github.com/BlackPhantomDev/piston/compare/v0.1.0-alpha.7...HEAD
[0.1.0-alpha.7]: https://github.com/BlackPhantomDev/piston/compare/v0.1.0-alpha.6...v0.1.0-alpha.7
[0.1.0-alpha.6]: https://github.com/BlackPhantomDev/piston/compare/v0.1.0-alpha.5...v0.1.0-alpha.6
[0.1.0-alpha.5]: https://github.com/BlackPhantomDev/piston/compare/v0.1.0-alpha.4...v0.1.0-alpha.5
[0.1.0-alpha.4]: https://github.com/BlackPhantomDev/piston/compare/v0.1.0-alpha.3...v0.1.0-alpha.4
[0.1.0-alpha.3]: https://github.com/BlackPhantomDev/piston/compare/v0.1.0-alpha.2...v0.1.0-alpha.3
[0.1.0-alpha.2]: https://github.com/BlackPhantomDev/piston/compare/v0.1.0-alpha.1...v0.1.0-alpha.2
[0.1.0-alpha.1]: https://github.com/BlackPhantomDev/piston/releases/tag/v0.1.0-alpha.1
