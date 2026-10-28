# Changelog

All notable changes to PiSton are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [Semantic Versioning](https://semver.org/).
Versions below 1.0.0 are in development – anything may still change.

## [Unreleased]

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

[Unreleased]: https://github.com/BlackPhantomDev/piston/compare/v0.1.0-alpha.2...HEAD
[0.1.0-alpha.2]: https://github.com/BlackPhantomDev/piston/compare/v0.1.0-alpha.1...v0.1.0-alpha.2
[0.1.0-alpha.1]: https://github.com/BlackPhantomDev/piston/releases/tag/v0.1.0-alpha.1
