# 🗺️ PiSton – Roadmap

**Stand:** 28.10.2026 · **Aktuelle Phase:** 2 – Home (UI)

```
Frontend  ▰▰▱▱▱▱  2 von 6 Phasen
Backend   ▱▱▱▱▱▱  0 von 6 Phasen
```

Übergabe-Notiz für die nächste Session. Verbindliche Projektregeln stehen in `AGENTS.md`,
die Commit-Konvention in der globalen `~/.claude/CLAUDE.md`.

> [!TIP]
> **Als Nächstes**
> 1. `js/api.js` mit Beispieldaten aus `js/mock/` – die Seiten holen ihre Daten nur über `api.js`
> 2. Home-Seite nach Mockup 02

> [!NOTE]
> **Reihenfolge: erst das Frontend, dann das Backend.** Alle Seiten entstehen zuerst vollständig mit
> Beispieldaten. Das Backend ersetzt danach Seite für Seite die Beispieldaten durch echte – die Seiten selbst
> sollen sich dabei kaum ändern.

---

## Überblick

| # | Phase | Ergebnis | Status |
|:-:|---|---|:-:|
| | **Frontend** | | |
| 0 | [Fundament](#phase-0--fundament) | Lizenz, Fonts, Design-Tokens, Basis-Komponenten | ✅ |
| 1 | [App-Shell](#phase-1--app-shell) | Sidebar, Hash-Routing, Sprachumschalter | ✅ |
| 2 | [Home (UI)](#phase-2--home-ui) | Datenschicht mit Beispieldaten, Home-Seite | 🚧 |
| 3 | [Konsole (UI)](#phase-3--konsole-ui) | Log-Ansicht, Filter, Befehlseingabe | ⬜ |
| 4 | [Einstellungen (UI)](#phase-4--einstellungen-ui) | Properties-Formular, Anbieter-Karten, Versionswechsel | ⬜ |
| 5 | [Feinschliff](#phase-5--feinschliff) | Zustände, schmale Bildschirme, Barrierefreiheit | ⬜ |
| | **Backend** | | |
| 6 | [Backend-Grundgerüst](#phase-6--backend-grundgerüst) | Node-Server, Konfiguration, `server.properties`-Parser | ⬜ |
| 7 | [Konsole live](#phase-7--konsole-live) | RCON, Live-Log, WebSocket | ⬜ |
| 8 | [Home live](#phase-8--home-live) | Status, Kennzahlen, Start/Stopp | ⬜ |
| 9 | [Einstellungen live](#phase-9--einstellungen-live) | Properties lesen und speichern | ⬜ |
| 10 | [Versionswechsel live](#phase-10--versionswechsel-live) | Backup + Vanilla, Paper, Fabric | ⬜ |
| 11 | [Release](#phase-11--release) | systemd, Installation, Screenshots | ⬜ |

✅ erledigt · 🚧 als Nächstes · ⬜ offen

---

## Phase 0 – Fundament

✅ abgeschlossen

- [x] Frontend-Dateien nach `public/` verschoben · `e6787c6`
- [x] Lizenz: `LICENCE` (AGPL-3.0), `ADDITIONAL_TERMS` (§7), `THIRD-PARTY-NOTICES` (OFL-Fonts) · `d4f7124`
- [x] AGPL-Kopfkommentar in allen Quelldateien · `988e7fa`
- [x] Pflicht-Footer „Powered by PiSton · Quellcode (AGPLv3)“ · `67d304d`
- [x] Lokale Variable Fonts: Inter, JetBrains Mono, Pixelify Sans · `c60b872`
- [x] Design-Tokens aus dem Styleguide-Mockup · `f42cc37`
- [x] Grundstile: Reset, Typo, Fokus, Utilities · `3391b01`
- [x] Komponenten-Styles · `f6b7032`
- [x] Web Components + i18n · `066e13e`
- [x] `main.css` als CSS-Einstieg · `c089555`
- [x] Komponenten-Übersicht `components.html` · `870c033`

## Phase 1 – App-Shell

✅ abgeschlossen

- [x] Layout-Styles + Layout-Tokens (`css/layout.css`) · `ecdcb50`
- [x] i18n: `LOCALES`, Rückfall auf Deutsch, `setLocale()`, `translate()` für `data-i18n` · `bdd4a08`
- [x] Hash-Routing `#/home`, `#/konsole`, `#/einstellungen` + Seiten-Platzhalter · `be16173`
- [x] Sprachumschalter `<lang-switch>` (Englisch „geplant“) · `1ab9235`
- [x] Sidebar nach Mockup 02, Topbar + Slide-in auf schmalen Bildschirmen · `11faa81`
- [x] README, Roadmap · `155162b`, `730e0fc`

## Phase 2 – Home (UI)

🚧 als Nächstes

- [ ] `js/api.js` – Schnittstelle der Seiten zu den Daten (später `fetch` + WebSocket nach AGENTS.md §9)
- [ ] `js/mock/` – Beispieldaten im Format der geplanten API-Antworten, inkl. simulierter Live-Updates
- [ ] Seitenkopf: Status-Badge + „Vanilla 26.3 · läuft seit …“
- [ ] Kennzahl-Karten: Spieler, TPS, Arbeitsspeicher (mit Balken)
- [ ] Spielerliste mit Dimension, Online-Zeit, Ping, Aktionsmenü
- [ ] Letzte Konsolenausgabe (Ausschnitt)
- [ ] Schnellaktionen: Welt speichern, Backup erstellen, Nachricht an alle
- [ ] Start / Stopp / Neustart (Hauptaktion je nach Status)
- [ ] Servername + Adresse in der Sidebar aus `api.js`

## Phase 3 – Konsole (UI)

- [ ] Log-Ansicht nach Mockup 03: Zeit, Level, Text; WARN/ERROR hervorgehoben
- [ ] Filter: Alle, Info, Warnungen, Fehler
- [ ] Befehlseingabe mit Verlauf (↑/↓) und Antwort im Log
- [ ] Häufige Befehle als Chips (füllen das Eingabefeld)
- [ ] Automatisch mitscrollen, pausiert beim Hochscrollen
- [ ] Log-Zeilen nur per `textContent` (Chat ist Nutzereingabe)

## Phase 4 – Einstellungen (UI)

- [ ] Formular für `server.properties` nach Mockup 04, gruppiert, mit Validierung im Browser
- [ ] „Speichern“ und „Speichern & neu starten“, Hinweis auf ungespeicherte Änderungen
- [ ] Anbieter-Karten: Vanilla / Paper / Fabric, Forge/NeoForge als „Geplant – noch nicht enthalten“
- [ ] Versionsauswahl (altes und neues Versionsschema)
- [ ] Ablauf des Versionswechsels mit Schritt-Fortschritt, Bestätigung bei Downgrade
- [ ] EULA-Hinweis, falls nicht akzeptiert
- [ ] Listen: Whitelist, OPs, Bans

## Phase 5 – Feinschliff

- [ ] Zustände auf allen Seiten: Server offline, lädt, Panel nicht erreichbar, leere Listen
- [ ] Fehlermeldungen im Format `{ error: { code, message } }` anzeigen
- [ ] Schmale Bildschirme: alle Seiten durchgehen
- [ ] Barrierefreiheit: Tastatur, Fokus, Screenreader, Kontrast (inkl. Platzhalterfarbe)
- [ ] Komponenten-Übersicht um neue Bausteine ergänzen

## Phase 6 – Backend-Grundgerüst

- [ ] `package.json` (`"type": "module"`, `"license": "AGPL-3.0-or-later"`), `node --test` eingerichtet
- [ ] `server/config.js` + `panel.config.example.json` – Datei + Umgebungsvariablen, validiert
- [ ] `server/index.js` – statischer HTTP-Server für `public/`, gebunden an die LAN-IP
- [ ] `server/properties.js` – erhält Kommentare, Leerzeilen, Reihenfolge; Java-Escaping; atomar schreiben
- [ ] Tests: properties-Round-Trip mit Kommentaren

## Phase 7 – Konsole live

- [ ] `server/rcon.js` – eigener RCON-Client mit Reconnect + Backoff
- [ ] `server/logwatch.js` – `latest.log` mitlesen, Log-Rotation, Puffer ~500 Zeilen
- [ ] WebSocket `/ws` mit `Origin`-Prüfung
- [ ] Konsole-Seite von Beispieldaten auf echte Daten umstellen
- [ ] Tests: RCON-Paketcodierung, Log-Zeilen-Parser

## Phase 8 – Home live

- [ ] `server/service.js` – nur die drei erlaubten `systemctl`-Aufrufe
- [ ] `server/metrics.js` – Spieler, TPS, RAM, CPU (Polling ≥ 5 s, nur mit Clients)
- [ ] `GET /api/status`, `POST /api/server/start|stop|restart`
- [ ] Home-Seite und Sidebar auf echte Daten umstellen

## Phase 9 – Einstellungen live

- [ ] `GET/PUT /api/properties` mit serverseitiger Validierung, RCON-Werte nie ans Frontend
- [ ] Listen: bei laufendem Server nur über RCON, sonst direkt in die Dateien
- [ ] Einstellungen-Seite auf echte Daten umstellen

## Phase 10 – Versionswechsel live

- [ ] `server/backup.js` – Welt-Backups (tar.gz), Pflicht vor jedem Wechsel
- [ ] `server/java.js` – installierte Java-Versionen
- [ ] Versionsvergleich für altes (`1.x.y`) und neues Schema (`26.x`) + Tests
- [ ] Provider Vanilla, danach Paper, Fabric (Tests mit gemockten Antworten)
- [ ] Ablauf mit Fortschritt per WebSocket, Rückfall auf `server.jar.prev`

## Phase 11 – Release

- [ ] Beispieldaten (`js/mock/`) entfernen
- [ ] `systemd/piston.service` + `sudoers-piston` (Beispiel)
- [ ] README: Installation
- [ ] Screenshots

## Später / Ideen

- 🌐 Englische Oberfläche: `js/i18n/en.js` anlegen und in `LOCALES` eintragen – der Umschalter ist schon da
- 🧩 Forge / NeoForge – bewusst nicht enthalten, nur als „geplant“ im UI

---

## Offene Punkte & Aufräumarbeiten

- [ ] **Gitignored, fehlt bei frischem Klon:** `AGENTS.md`, `design/` – und `.gitignore` ignoriert sich selbst. Entscheiden, ob sie ins Repo gehören.
- [ ] `AGENTS.md` §4 beschreibt die Soll-Struktur, nicht den Ist-Zustand (siehe [Ordnerstruktur](#ordnerstruktur))
- [ ] Platzhalterfarbe `#757575` hat auf `#18191B` nur ~3,8:1 Kontrast (Ziel ≥ 4,5:1)
- [ ] Fonts als WOFF2 statt TTF (~60–70 % kleiner)
- [ ] Ungenutzte statische Inter-Schnitte in `public/assets/fonts/Inter/static/` (nur die Variable Fonts werden geladen)
- [ ] Komponenten bisher nur visuell geprüft, keine automatisierten Tests
- [x] `README.md` mit Beschreibung, Lizenz, Disclaimer, Sicherheitshinweis
- [x] Repo aus dem Synology-Drive-Ordner nach `~/dev.local/piston` umgezogen
- [x] `index.html` lädt `js/main.js`, Favicon-Typ korrigiert

---

## Getroffene Entscheidungen

### Lizenz
- **AGPL-3.0-or-later** mit Zusatzbedingungen nach §7 (`ADDITIONAL_TERMS`):
  1. Namensnennung „Powered by PiSton“ + Link auf `https://github.com/BlackPhantomDev/piston`
     auf **jeder Seite** des Panels (Footer *oder* Sidebar) – nie entfernen.
  2. Veränderte Versionen müssen als verändert gekennzeichnet sein.
  3. Keine Markenrechte am Namen „PiSton“ / Logo.
- Copyright-Inhaber: **„Mischa S.“** (so in `ADDITIONAL_TERMS` und allen Kopfkommentaren).
- **Jede neue Quelldatei** (JS, CSS, HTML) beginnt mit dem AGPL-Kopfkommentar. Vorlage: Anfang von `public/css/tokens.css`.
- `LICENCE` enthält ausschließlich den unveränderten AGPL-Text (damit GitHub die Lizenz erkennt).

### Ordnerstruktur
Ist-Zustand, weicht bewusst von `AGENTS.md` §4 ab – vorhandene Dateien wurden nur verschoben, nicht umbenannt:

| AGENTS.md | tatsächlich |
|---|---|
| `public/fonts/` | `public/assets/fonts/` |
| `public/brand/` | `public/assets/logo/` |
| `public/css/base.css` | `public/css/style.css` |
| `public/js/app.js` | `public/js/main.js` (Einstieg) + `router.js` + `nav.js` |
| `docs/design/` | `design/mockups/` (gitignored) |
| – | `public/main.css` (CSS-Einstieg, `@import` aller Stylesheets) |
| – | `public/css/layout.css` (App-Shell) |

### Komponenten
- **Nur CSS** auf nativen Elementen (bessere Barrierefreiheit, kein JS nötig):
  `.btn` (`--primary/--secondary/--ghost/--danger`, `--s/--l`, `--icon`), `.input` (`--mono`),
  `.select`, `.input-group` + `__addon`, `.checkbox`, `.card`, `.console-input`, `.setting-list`.
  Kein `<mc-button>` – ein `<button class="btn">` reicht.
- **Web Components** (Light DOM, registrieren sich beim Import, gesammelt in `js/components/index.js`):
  - `<mc-field label help error>` – Label/Hilfe/Fehler, verdrahtet `for`, `aria-describedby`, `aria-invalid`; Fehler per `el.error = '…'`.
  - `<mc-toggle checked disabled name value description layout="row">` – `<button role="switch">`, form-associated, feuert `change`. `layout="row"` = große Einstellungszeile (52 × 28) aus Mockup 04.
  - `<mc-stepper>` – umschließt `<input type="number">`, −/+ an min/max gesperrt.
  - `<mc-range>` – umschließt `<input type="range">`, füllt die Spur, schreibt Wert in `<output for>`.
  - `<status-badge status="online|offline|starting|stopping">` – Text + Form-Marker, `role="status"`.
  - `<lang-switch>` – Sprachumschalter aus `LOCALES`, native Radios als Segment-Schalter.

### App-Shell (`index.html`, `css/layout.css`)
- Sidebar 240 px nach Mockup 02: Logo 40 px + Schriftzug + Servername (`#server-name`), Nav, Adresse-Box (`#server-address`), Sprachumschalter.
  Servername und Adresse zeigen Platzhalter (`[SERVER NAME]`, `[IP ADRESS:PORT]`), bis das Backend sie liefert.
- Unter 900 px: Topbar mit Menü-Button, Sidebar gleitet über den Inhalt (`.app[data-nav-open]`).
  Schließen per Escape, Klick auf den Hintergrund oder Navigation; Fokus wandert in die Nav bzw. zurück zum Button.
- Seiten in `js/pages/` exportieren `titleKey` und `render(root)` (optional Rückgabe einer Cleanup-Funktion).
  Unbekannte Hashes → `#/home`. Nach Navigation Fokus auf `<h1>`.
- Pflicht-Namensnennung als Footer **in der Inhaltsspalte** – so ist sie auch auf schmalen Bildschirmen
  sichtbar, wenn die Sidebar eingeklappt ist.

### Sprache (i18n)
- UI-Texte zentral in `js/i18n/de.js`, Zugriff über `t('status.online')`.
  Statisches HTML: `data-i18n` (Text) bzw. `data-i18n-label` (aria-label), befüllt von `translate()`.
- Sprachen in `LOCALES` (`js/i18n/index.js`); Deutsch ist Standard und Rückfall für fehlende Schlüssel.
- Auswahl in `localStorage` (`piston.locale`), Wechsel lädt die Seite neu. Regeln: `AGENTS.md` §7 „Sprache (i18n)“.
