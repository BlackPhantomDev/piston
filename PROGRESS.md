# 🗺️ PiSton – Roadmap

**Stand:** 28.10.2026 · **Aktuelle Phase:** 2 – Backend-Grundgerüst

```
Fortschritt  ▰▰▱▱▱▱▱▱▱  2 von 9 Phasen
```

Übergabe-Notiz für die nächste Session. Verbindliche Projektregeln stehen in `AGENTS.md`,
die Commit-Konvention in der globalen `~/.claude/CLAUDE.md`.

> [!TIP]
> **Als Nächstes**
> 1. Anbieter-Karten (Vanilla / Paper / Fabric, Forge/NeoForge deaktiviert) aus Mockup 04 – reines Frontend, passt noch zur App-Shell
> 2. `package.json` + `server/config.js` + statischer HTTP-Server für `public/`

---

## Überblick

| # | Phase | Ergebnis | Status |
|:-:|---|---|:-:|
| 0 | [Fundament](#phase-0--fundament) | Lizenz, Fonts, Design-Tokens, Basis-Komponenten | ✅ |
| 1 | [App-Shell](#phase-1--app-shell) | Sidebar, Hash-Routing, Sprachumschalter | ✅ |
| 2 | [Backend-Grundgerüst](#phase-2--backend-grundgerüst) | Node-Server liefert das Panel aus | 🚧 |
| 3 | [`server.properties`](#phase-3--serverproperties) | Parser mit Round-Trip-Tests | ⬜ |
| 4 | [Konsole](#phase-4--konsole) | Live-Log + Befehle über RCON | ⬜ |
| 5 | [Home](#phase-5--home) | Status, Kennzahlen, Start/Stopp | ⬜ |
| 6 | [Einstellungen](#phase-6--einstellungen) | Properties bearbeiten, Speichern & Neustart | ⬜ |
| 7 | [Versionswechsel](#phase-7--versionswechsel) | Backup + Vanilla, Paper, Fabric | ⬜ |
| 8 | [Release](#phase-8--release) | systemd, README, Screenshots | ⬜ |

✅ erledigt · 🚧 in Arbeit · ⬜ offen

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

## Phase 2 – Backend-Grundgerüst

🚧 als Nächstes

- [ ] Anbieter-Karten aus Mockup 04 (Frontend, Forge/NeoForge als „Geplant – noch nicht enthalten“)
- [ ] `package.json` (`"type": "module"`, `"license": "AGPL-3.0-or-later"`)
- [ ] `server/config.js` – `panel.config.json` + Umgebungsvariablen laden und validieren
- [ ] `panel.config.example.json`
- [ ] `server/index.js` – statischer HTTP-Server für `public/`, gebunden an die LAN-IP
- [ ] `node --test` eingerichtet

## Phase 3 – `server.properties`

- [ ] `server/properties.js` – Parser/Serializer, erhält Kommentare, Leerzeilen, Reihenfolge
- [ ] Java-Properties-Escaping (`\:`, `\=`, Unicode im MOTD)
- [ ] Atomar schreiben (Temp-Datei + `rename`, vorher `.bak`)
- [ ] Validierung je Schlüssel (Typ, Bereich, Enum)
- [ ] Tests: Round-Trip mit Kommentaren

## Phase 4 – Konsole

- [ ] `server/rcon.js` – eigener RCON-Client mit Reconnect + Backoff
- [ ] `server/logwatch.js` – `latest.log` mitlesen, Log-Rotation, Puffer ~500 Zeilen
- [ ] WebSocket `/ws` mit `Origin`-Prüfung
- [ ] Konsole-Seite nach Mockup 03: Filter, Live-Ausgabe, Eingabe, häufige Befehle
- [ ] Tests: RCON-Paketcodierung, Log-Zeilen-Parser

## Phase 5 – Home

- [ ] `server/service.js` – start / stop / restart über die drei erlaubten `systemctl`-Aufrufe
- [ ] `server/metrics.js` – Spieler, TPS, RAM, CPU (Polling ≥ 5 s, nur mit Clients)
- [ ] `GET /api/status`, `POST /api/server/*`
- [ ] Home-Seite nach Mockup 02: Kennzahlen, Spielerliste, letzte Konsolenausgabe, Schnellaktionen
- [ ] Servername + Adresse in der Sidebar aus echten Daten

## Phase 6 – Einstellungen

- [ ] `GET/PUT /api/properties`
- [ ] Einstellungen-Seite nach Mockup 04 inkl. Validierung
- [ ] „Speichern“ und „Speichern & neu starten“
- [ ] Listen (Whitelist, OPs, Bans): bei laufendem Server nur über RCON

## Phase 7 – Versionswechsel

- [ ] `server/backup.js` – Welt-Backups (tar.gz), Pflicht vor jedem Wechsel
- [ ] `server/java.js` – installierte Java-Versionen
- [ ] Versionsvergleich für altes (`1.x.y`) und neues Schema (`26.x`) + Tests
- [ ] Provider Vanilla, danach Paper, Fabric (Tests mit gemockten Antworten)
- [ ] Ablauf mit Fortschritt per WebSocket, Rückfall auf `server.jar.prev`
- [ ] Downgrade nur mit Bestätigung, EULA-Hinweis

## Phase 8 – Release

- [ ] `systemd/piston.service` + `sudoers-piston` (Beispiel)
- [ ] README: Installation, Sicherheitshinweis, ufw-Regeln
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
