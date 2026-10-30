<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/assets/logo/piston-logo.svg">
    <source media="(prefers-color-scheme: light)" srcset="public/assets/logo/piston-logo-light.svg">
    <img src="public/assets/logo/piston-logo-light.svg" alt="PiSton logo" width="120" height="120">
  </picture>
</p>

<h1 align="center">PiSton</h1>

<p align="center">
  <strong>A tiny web panel for your Minecraft server on a Raspberry Pi.</strong><br>
  Start, stop and watch a single Minecraft Java server from your browser – lean enough to run next to the game on a Pi.
</p>

<p align="center">
  <a href="LICENCE"><img src="https://img.shields.io/badge/license-AGPL--3.0--or--later-6DB33F" alt="License: AGPL-3.0-or-later"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/version-0.1.0--alpha.6-A3A19C" alt="Version 0.1.0-alpha.6"></a>
  <img src="https://img.shields.io/badge/status-early%20development-A3A19C" alt="Status: early development">
  <img src="https://img.shields.io/badge/python-%E2%89%A5%203.11-3A3B40" alt="Python 3.11 or newer">
</p>

> [!WARNING]
> **Home use on your local network only. There is no login. Never expose PiSton to the internet.**
> Anyone who can reach the panel can control your server. See [Security](#security).

---

## Status

PiSton is in **early development** and cannot manage a real server yet. The frontend pages are done –
Home, Console and Settings – and run on sample data that reacts like a vanilla server.
Loading states, error messages, narrow screens, accessibility, a "panel unreachable" screen and confirming
the EULA in the panel are done too – the frontend is complete. Next comes the Python backend.

Current version: **0.1.0-alpha.6** – see the [changelog](CHANGELOG.md).
Progress is tracked in the [roadmap](PROGRESS.md) (German).

## Features

Planned for the first release:

- **Server control** – start, stop and restart via systemd
- **Live console** – follow `latest.log` in real time and send commands over RCON
- **Players** – message, op, kick and ban players; manage the whitelist, operators and bans
- **Settings** – edit `server.properties` in a GUI with validation; comments and order are kept
- **Version switching** – change version and server type with a mandatory world backup first
- **Metrics** – players online, TPS, RAM and CPU of the server process

### Supported server types

| Type | Status |
|---|---|
| Vanilla | planned for v1 |
| Paper | planned for v1 |
| Fabric | planned for v1 |
| Forge / NeoForge | known, not included – shown as “planned” in the UI |
| Bedrock | not planned |

## Design goals

- **One server, one Pi.** No multi-server setup, no hosting for others.
- **Small footprint.** Target under 80 MB RAM for the panel, so a Pi 3B+ can still run it.
- **No build step.** Vanilla HTML, CSS and JavaScript with native ES modules and Web Components.
  Copying the folder is the deployment.
- **Almost no dependencies.** The backend is Python with `asyncio`; the only planned runtime dependency is
  [`aiohttp`](https://docs.aiohttp.org/) for HTTP, WebSocket and static files. Everything else comes from the
  standard library, and the RCON client is written from scratch.
- **Nothing else to install.** On the Pi, PiSton needs only Python (preinstalled on Raspberry Pi OS) and the Java
  your Minecraft version requires – no Node.js, no web server, no database.
- **Works offline.** Fonts and assets are served locally – nothing is loaded from a CDN.
- **Accessible.** Keyboard navigation, visible focus, status shown with text and shape, never by colour alone.

## Requirements

| | |
|---|---|
| Hardware | Raspberry Pi 4B (8 GB) recommended; the panel itself also runs on a Pi 3B+ |
| OS | Raspberry Pi OS 64-bit |
| Panel | Python 3.11 or newer (preinstalled on Raspberry Pi OS), in its own virtual environment |
| Minecraft | Java 25 for Minecraft 26.x, Java 21 for 1.20.5 – 1.21.11 |

The Minecraft server is expected in `/opt/minecraft`, owned by a `minecraft` user and running as
`minecraft.service` with RCON enabled. PiSton itself goes to `/opt/piston` with a virtual environment
in `/opt/piston/.venv` (Raspberry Pi OS does not allow `pip install` into the system Python) and runs as
`piston.service`. Installation instructions will follow with the first release.

PiSton never accepts the [Minecraft EULA](https://aka.ms/MinecraftEULA) for you – you confirm it yourself.
It also never ships a `server.jar`: server files are downloaded straight from Mojang or the chosen provider.

## Accessing the panel

Open PiSton in a browser on your home network:

- `http://<IP of your Pi>:8080`, or
- `http://raspberrypi.local:8080` – the Pi's hostname, announced by Avahi, which Raspberry Pi OS ships with.

On start, PiSton writes the address to its log (`PiSton läuft auf http://<ip>:<port>`). Give the Pi a
**fixed IP** with a DHCP reservation in your router, so the address – and the server address your friends
use – does not change.

PiSton speaks **plain HTTP only, no HTTPS**. This is a deliberate choice for home use on a local network:
no certificates to create or renew. It is another reason never to make the panel reachable from the internet.

## Security

PiSton has no accounts and no login by design. Protection comes from keeping it inside your home network:

- The panel binds to the Pi's **LAN IP** by default, not to `0.0.0.0`. If no private address is found,
  it refuses to start instead of listening everywhere.
- **Never forward** the panel port (default `8080`) or the RCON port (`25575`) in your router.
  Only the game port `25565` may be forwarded if friends outside your network should join.
- The RCON password never leaves the backend and is never sent to the browser.
- The panel may only run three commands as root: `systemctl start|stop|restart minecraft.service`
  (via a narrow sudoers rule).
- WebSocket connections and every request that changes something are checked against the page origin,
  so other websites cannot control the panel from your browser.
- Commands are never built as shell strings, and file paths from requests cannot leave the server folder.

A firewall that only allows your local network is recommended, for example with `ufw`
(adjust the subnet to your network):

```sh
sudo ufw default deny incoming
sudo ufw allow from 192.168.1.0/24 to any port 22 proto tcp    # SSH from the LAN
sudo ufw allow from 192.168.1.0/24 to any port 8080 proto tcp  # PiSton from the LAN
sudo ufw allow 25565/tcp                                       # Minecraft
sudo ufw enable
```

## Development

There is no backend yet, so the frontend can be previewed with any static file server – Python's built-in
one is enough. It runs on sample data: starting and stopping, console commands, kicks and list changes are
simulated. It has to be served over HTTP because ES modules do not load from `file://`.

```sh
git clone https://github.com/BlackPhantomDev/piston.git
cd piston
python3 -m http.server 8080 --directory public
```

Then open <http://localhost:8080> for the panel and <http://localhost:8080/components.html>
for an overview of all components and their states. To see what happens when the panel cannot be
reached, open <http://localhost:8080/?sim=lost> – the sample connection breaks after a few seconds.
<http://localhost:8080/?sim=error> shows the error messages: every change fails, and every list or
setting fails to load the first time. <http://localhost:8080/?sim=eula> starts with a server whose EULA
is not accepted yet.

### Demo

`python3 scripts/build_dist.py` builds a demo into `dist/`: the panel on sample data, no backend and no
Minecraft server needed. Upload the contents of `dist/` to any static web host. The demo always uses the
sample data in `public/js/mock/` – also once the real backend exists – so every change to the panel can be
shown without a second branch. Add `?sim=lost` to the address to show a lost connection, `?sim=error` to
show error messages, `?sim=eula` for a server whose EULA is not accepted yet – or several: `?sim=lost,error`.

### Backend

The backend will be a Python package in `server/`, started with `python -m server`; tests run with
`python -m unittest`.

### Project structure

```
pyproject.toml         version and Python dependencies
scripts/build_dist.py  builds the demo into dist/
public/
├─ index.html          app shell: sidebar, navigation, content
├─ components.html     component overview
├─ main.css            stylesheet entry point
├─ css/                tokens, base styles, components, layout
├─ js/
│  ├─ main.js          entry point
│  ├─ router.js        hash routing (#/home, #/console, #/settings)
│  ├─ api.js           the pages' only access to server data – picks demo or live
│  ├─ api/demo.js      demo: everything on sample data
│  ├─ mock/            the sample data
│  ├─ components/      Web Components (<piston-action-menu>, <piston-log-view>, <piston-status-badge>, …)
│  ├─ i18n/            UI strings
│  └─ pages/           one module per page
└─ assets/             logo and fonts
```

The UI speaks German and English – switch with DE | EN in the sidebar (on phones in the top bar).
All strings live in `public/js/i18n/`, so another language is one more file.

## License

Copyright © 2026 Mischa S.

PiSton is free software, licensed under the
[GNU Affero General Public License v3.0 or later](LICENCE), with
[additional terms under Section 7](ADDITIONAL_TERMS):

1. **Attribution** – every page of the web interface must show “Powered by PiSton” with a working
   link to this repository. It may not be removed or hidden.
2. **Modified versions** must be marked as modified and may not be presented as the original PiSton.
3. **No trademark rights** to the name “PiSton” or its logo are granted.

If you run a modified version for others over a network, the AGPL requires you to offer them its source code.

The bundled fonts (Chakra Petch, Inter, JetBrains Mono, Pixelify Sans) are licensed under the SIL Open Font License 1.1 –
see [THIRD-PARTY-NOTICES](THIRD-PARTY-NOTICES).

---

<sub>Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</sub>
