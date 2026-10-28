# Changelog

All notable changes to PiSton are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [Semantic Versioning](https://semver.org/).
Versions below 1.0.0 are in development – anything may still change.

## [Unreleased]

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

[Unreleased]: https://github.com/BlackPhantomDev/piston/compare/v0.1.0-alpha.1...HEAD
[0.1.0-alpha.1]: https://github.com/BlackPhantomDev/piston/releases/tag/v0.1.0-alpha.1
