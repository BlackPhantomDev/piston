# 🗺️ PiSton – Roadmap

**Stand:** 28.10.2026 · **Aktuelle Phase:** 4 – Einstellungen (UI), danach 5 – Feinschliff

```
Frontend  ▰▰▰▱▱▱  3 von 6 Phasen
Backend   ▱▱▱▱▱▱  0 von 6 Phasen
```

Übergabe-Notiz für die nächste Session. Verbindliche Projektregeln stehen in `AGENTS.md`,
die Commit-Konvention in der globalen `~/.claude/CLAUDE.md`.

> [!TIP]
> **Als Nächstes**
> Home-Seite fertigstellen (Mockup 02): Aktionsmenü je Spieler; Servername + Adresse in der Sidebar

> [!NOTE]
> **Reihenfolge: erst das Frontend, dann das Backend.** Alle Seiten entstehen zuerst vollständig mit
> Beispieldaten. Das Backend ersetzt danach Seite für Seite die Beispieldaten durch echte – die Seiten selbst
> sollen sich dabei kaum ändern.

> [!IMPORTANT]
> **Beispieldaten als Demo sichern, bevor das Backend kommt.** Die Mock-Daten (Logs, Systemwerte wie Spieler,
> TPS, RAM, CPU) und die Mock-Variante von `api.js` bleiben als Kopie erhalten, damit das Panel ohne
> Minecraft-Server als Demo laufen kann. Die Sicherung passiert **vor** dem ersten Umstellen auf echte Daten
> (Anfang Phase 6) und wird in Phase 11 **nicht** gelöscht.

> [!WARNING]
> **Rechtliches beachten:** `eula=true` wird nur nach Bestätigung durch den Nutzer gesetzt.
> Keine `server.jar` wird weitergegeben. Das Logo darf nicht wie der Minecraft-Kolben aussehen.
> Regeln und Checkliste stehen unter
> [Rechtliches](#rechtliches--marke-eula-weiterverbreitung).

---

## Überblick

| # | Phase | Ergebnis | Status |
|:-:|---|---|:-:|
| | **Frontend** | | |
| 0 | [Fundament](#phase-0--fundament) | Lizenz, Fonts, Design-Tokens, Basis-Komponenten | ✅ |
| 1 | [App-Shell](#phase-1--app-shell) | Sidebar, Hash-Routing, Sprachumschalter | ✅ |
| 2 | [Home (UI)](#phase-2--home-ui) | Datenschicht mit Beispieldaten, Home-Seite | 🚧 |
| 3 | [Konsole (UI)](#phase-3--konsole-ui) | Log-Ansicht, Filter, Befehlseingabe | ✅ |
| 4 | [Einstellungen (UI)](#phase-4--einstellungen-ui) | Properties-Formular, Anbieter-Karten, Versionswechsel | 🚧 |
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

## Rechtliches – Marke, EULA, Weiterverbreitung

> [!CAUTION]
> Die Punkte stammen aus einem Gespräch mit Claude am 28.10.2026. Es ging um die Markenrichtlinien von
> Mojang/Microsoft und von Raspberry Pi Ltd. Das ist **keine Rechtsberatung**, aber die Regeln gelten trotzdem
> verbindlich für das Projekt.

### Regeln

- **Name:** „PiSton“ ist durch die Schreibweise und den Pi-Bezug eigenständig genug. Ausgesprochen klingt es
  trotzdem wie „Piston“. Es darf also nie wie ein offizielles Mojang-Tool wirken.
  - „Minecraft“ erscheint nie in Name, Logo oder Titel.
  - Beschreibend ist es erlaubt, z. B. „for Minecraft Java Edition“ oder das Feld „Minecraft-Version“.
  - Wo „Minecraft“ steht, gehört der Disclaimer dazu: *Not an official Minecraft product. Not approved by or
    associated with Mojang or Microsoft.*
- **Logo:** Ein Kolben ist ein normales technisches Bauteil, aber das Logo darf nicht wie der Minecraft-Kolben
  aussehen.
  - Nicht verwenden: einen Würfel als Sockel mit ausgefahrener Stange und flacher Platte, Pixeltextur,
    Holzplatte oder Steinseiten.
  - Besser: ein echter mechanischer Kolben, also Zylinder und Kolbenstange, flach oder als Linie gezeichnet.
  - Grün darf bleiben.
- **Raspberry Pi:** „Pi“ allein ist frei, es ist der griechische Buchstabe.
  - Das Himbeer-Logo und „Raspberry Pi“ gehören nie in Name oder Logo.
  - Beschreibend ist es erlaubt („runs on a Raspberry Pi“).
- **EULA:** Ein Minecraft-Server startet erst, wenn in `eula.txt` `eula=true` steht. Das Panel setzt das **nie
  selbst**, auch nicht nebenbei bei einem Versionswechsel oder bei der Einrichtung.
  - Der Nutzer bestätigt ausdrücklich mit einer Checkbox. Sie ist nie vorausgewählt.
  - Daneben steht ein Link zur EULA (`https://aka.ms/MinecraftEULA`).
- **Weiterverbreitung:** Die Guidelines verbieten, das Spiel oder Spieldateien weiterzugeben.
  - Keine `server.jar` und keine anderen Spieldateien im Repo, in Releases oder in einem fertigen Pi-Image.
  - Das Backend lädt die Jar immer direkt vom Anbieter. Für Vanilla ist das Mojangs Versions-Manifest,
    die SHA1-Prüfsumme wird geprüft (AGENTS.md §6.5).

### Checkliste

- [x] Name „PiSton“ geprüft, „Minecraft“ kommt im Namen nicht vor
- [x] „Minecraft“ und „Raspberry Pi“ nur beschreibend:
      Tagline, README, `package.json`, im UI das Feld „Minecraft-Version“ und der EULA-Hinweis
- [x] Disclaimer im README
- [x] Version wechseln ist gesperrt, solange die EULA nicht akzeptiert ist. Es gibt einen Prüfpunkt mit Link zur EULA.
- [x] **Logo überarbeitet:** Der alte Würfel-Sockel erinnerte an den Minecraft-Kolben.
  - Jetzt: Zylinder als Sockel, Kolbenstange, runder grüner Kopf mit π.
  - Die Logo-Dateien in `public/assets/logo/` sind neu erzeugt.
  - Neu ist die helle Variante `piston-logo-light(-512)` für hellen Grund.
- [x] README-Logo per `<picture>` + `prefers-color-scheme`: GitHub zeigt im hellen Modus `piston-logo-light.svg`,
      im dunklen `piston-logo.svg` (AGENTS.md §1)
- [ ] **EULA bestätigen im UI** (Phase 5):
  - Hinweis, wenn `eula.txt` nicht `true` ist: auf Home (der Server startet dann nicht) und in den Einstellungen.
  - Dazu ein Link zur EULA, eine Checkbox (nie vorausgewählt) und ein Button.
  - Bisher gibt es nur den Prüfpunkt beim Versionswechsel.
- [ ] `.gitignore`: `*.jar` ausschließen, damit keine Server-Jar versehentlich im Repo landet (Phase 6)
- [ ] **EULA-Endpunkt** (Phase 9): schreibt `eula=true` nur auf die ausdrückliche Bestätigung aus dem UI.
      Fehlt noch in AGENTS.md §9.
- [ ] **Release** (Phase 11):
  - Das Image und die Installation enthalten keine Spieldateien.
  - Das README erklärt, dass die Jar beim Einrichten direkt vom Anbieter geladen wird.
  - Das README erklärt, dass der Nutzer die EULA selbst akzeptiert.
  - Der Disclaimer steht auch in den Release-Notes bzw. in der Beschreibung des Images.

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
- [x] Hash-Routing `#/home`, `#/konsole`, `#/einstellungen` + Seiten-Platzhalter · `be16173` (später umbenannt in `#/console`, `#/settings`)
- [x] Sprachumschalter `<lang-switch>` (Englisch „geplant“) · `1ab9235`
- [x] Sidebar nach Mockup 02, Topbar + Slide-in auf schmalen Bildschirmen · `11faa81`
- [x] README, Roadmap · `155162b`, `730e0fc`

## Phase 2 – Home (UI)

🚧 als Nächstes

- [x] Boxen: `.card` (+ Kopf, Body, Liste, Outline), `.stat`, `.action-card`, `.card-grid`
- [x] `js/api.js` – Schnittstelle der Seiten zu den Daten (später `fetch` + WebSocket nach AGENTS.md §9)
- [x] `js/mock/` – Beispieldaten im Format der geplanten API-Antworten, inkl. simulierter Live-Updates
- [x] Seitenkopf: Status-Badge + „Vanilla 26.3 · läuft seit …“
- [x] Kennzahl-Karten: Spieler, TPS, Arbeitsspeicher, CPU (mit Balken)
- [x] Spielerliste mit Dimension und Ping (Online-Zeit bewusst weggelassen)
- [ ] Aktionsmenü je Spieler (…)
- [x] Letzte Konsolenausgabe (Ausschnitt) mit `<log-view>`
- [x] Schnellaktionen: Welt speichern, Backup erstellen, Nachricht an alle (Dialog), Tag setzen
- [x] Gliederung: Server-Monitoring, System-Monitoring, Spieler + Konsole, Schnellaktionen
- [x] Start / Stopp / Neustart (Buttons je nach Status, im Mock mit Übergängen)
- [ ] Servername + Adresse in der Sidebar aus `api.js`

## Phase 3 – Konsole (UI)

✅ abgeschlossen

- [x] `<log-view>`: Zeit, Level, Text; WARN/ERROR hervorgehoben, Chat-Absender grün
- [x] Konsole-Seite nach Mockup 03: Kopf mit Status, Panel mit Befehlszeile, „Häufige Befehle“
- [x] Filter: Alle, Info, Warnungen, Fehler (`filter`-Attribut, reines CSS) + Textsuche
- [x] Befehlseingabe mit Verlauf (↑/↓); eigener Befehl (CMD) + Antwort (RCON) im Log
- [x] Häufige Befehle als Chips (füllen das Eingabefeld, Cursor dahinter)
- [x] Automatisch mitscrollen, pausiert beim Hochscrollen, Button „Zu den neuesten Zeilen“
- [x] „Log herunterladen“ (Puffer der Ansicht als .log) und „Ansicht leeren“
- [x] Offline: Eingabe und Chips gesperrt, Hinweis im Eingabefeld
- [x] Log-Zeilen nur per `textContent` (Chat ist Nutzereingabe)

## Phase 4 – Einstellungen (UI)

🚧 fast fertig

- [x] Seite nach Mockup 04: Abschnitte Allgemein, Welt, Spieler & Regeln, Leistung & Netzwerk, Server-Version, Gefahrenzone
- [x] Sprungnavigation zu den Abschnitten, markiert den Abschnitt im Blick
- [x] Validierung im Browser (Pflichtfelder, Zahlenbereiche), Fehler am Feld, Fokus aufs erste falsche Feld
- [x] Speicherleiste: „Verwerfen“, „Speichern“, „Speichern & neu starten“, Hinweis auf ungespeicherte Änderungen
- [x] Server-Port nur bei gestopptem Server änderbar
- [x] Anbieter-Karten: Vanilla / Paper / Fabric, Forge/NeoForge als „Geplant – noch nicht enthalten“
- [x] Versionsauswahl (altes und neues Versionsschema, `js/versions.js`), Snapshots optional
- [x] Prüfung vor dem Wechsel: Java-Anforderung, Backup, gleiche Version, Downgrade, EULA (mit Link)
- [x] Ablauf des Versionswechsels mit Schritt-Fortschritt, Bestätigung bei Downgrade
- [x] Gefahrenzone: Welt zurücksetzen, Standardwerte – beide mit Bestätigungsdialog (`js/dialogs.js`)
- [ ] Listen: Whitelist, OPs, Bans – nicht im Mockup, Gestaltung offen
- [ ] Warnung bei ungespeicherten Änderungen auch beim Seitenwechsel im Panel (bisher nur beim Schließen des Tabs)

## Phase 5 – Feinschliff

- [ ] Zustände auf allen Seiten: Server offline, lädt, Panel nicht erreichbar, leere Listen
- [ ] Fehlermeldungen im Format `{ error: { code, message } }` anzeigen
- [ ] Schmale Bildschirme: alle Seiten durchgehen
- [ ] Barrierefreiheit: Tastatur, Fokus, Screenreader, Kontrast (inkl. Platzhalterfarbe)
- [ ] Komponenten-Übersicht um neue Bausteine ergänzen

## Phase 6 – Backend-Grundgerüst

- [ ] **Zuerst: Demo-Sicherung** – Kopie von `js/mock/` (Logs, Systemwerte, alles bis dahin Dazugekommene)
      und der Mock-Variante von `js/api.js`, z. B. nach `demo/`. Erst danach etwas auf echte Daten umstellen.
- [x] `package.json` (`"type": "module"`, `"license": "AGPL-3.0-or-later"`, Version) – vorgezogen
- [ ] `node --test` eingerichtet, Test: `public/js/version.js` = `version` in `package.json`
- [ ] `server/config.js` + `panel.config.example.json` – Datei + Umgebungsvariablen, validiert
- [ ] `server/index.js` – statischer HTTP-Server für `public/`, gebunden an die LAN-IP
- [ ] `server/properties.js` – erhält Kommentare, Leerzeilen, Reihenfolge; Java-Escaping; atomar schreiben
- [ ] Tests: properties-Round-Trip mit Kommentaren

## Phase 7 – Konsole live

- [ ] `server/rcon.js` – eigener RCON-Client mit Reconnect + Backoff
- [ ] `server/logwatch.js` – `latest.log` mitlesen, Log-Rotation, Puffer ~500 Zeilen
- [ ] WebSocket `/ws` mit `Origin`-Prüfung
- [ ] Konsole-Seite von Beispieldaten auf echte Daten umstellen
- [ ] „Log herunterladen“: liefert bisher nur den Puffer der Ansicht – für die ganze `latest.log` fehlt ein Endpunkt (nicht in AGENTS.md §9)
- [ ] Tests: RCON-Paketcodierung, Log-Zeilen-Parser

## Phase 8 – Home live

- [ ] `server/service.js` – nur die drei erlaubten `systemctl`-Aufrufe
- [ ] `server/metrics.js` – Spieler, TPS, RAM, CPU (Polling ≥ 5 s, nur mit Clients)
- [ ] `GET /api/status`, `POST /api/server/start|stop|restart`
- [ ] Home-Seite und Sidebar auf echte Daten umstellen

## Phase 9 – Einstellungen live

- [ ] `GET/PUT /api/properties` mit serverseitiger Validierung, RCON-Werte nie ans Frontend
- [ ] Endpunkt für Panel-Einstellungen (RAM/-Xmx, automatischer Neustart) – fehlt in AGENTS.md §9
- [ ] Automatischer Neustart: Zeitplan im Backend (Timer muss sich laut AGENTS.md §2 rechtfertigen) oder per systemd-Timer
- [ ] Welt zurücksetzen: Endpunkt fehlt in AGENTS.md §9
- [ ] Listen: bei laufendem Server nur über RCON, sonst direkt in die Dateien
- [ ] Einstellungen-Seite auf echte Daten umstellen

## Phase 10 – Versionswechsel live

- [ ] `server/backup.js` – Welt-Backups (tar.gz), Pflicht vor jedem Wechsel
- [ ] `server/java.js` – installierte Java-Versionen
- [ ] Versionsvergleich für altes (`1.x.y`) und neues Schema (`26.x`) + Tests
- [ ] Provider Vanilla, danach Paper, Fabric (Tests mit gemockten Antworten)
- [ ] Ablauf mit Fortschritt per WebSocket, Rückfall auf `server.jar.prev`

## Phase 11 – Release

- [ ] Beispieldaten (`js/mock/`) aus dem Panel entfernen – die Demo-Kopie aus Phase 6 bleibt erhalten
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
- [x] Display-Schrift Chakra Petch statt Pixelify Sans (Titel, Überschriften, Kennzahlen, Avatare); Pixelify nur noch im Logo (`--font-logo`)
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
- **Boxen** (nur CSS, Vorlagen auf `components.html`):
  - `.card` – Grundbox; `--outline` (nur Rahmen), `--compact` (enger), `--flush` (ohne Innenabstand).
    Mit `.card__header` (Titel + `.card__meta` / `.card__link`) entfällt der Innenabstand automatisch;
    Inhalt dann in `.card__body` (`--console` = dunkle Konsolenfläche), `.card__list` mit `.list-row` oder `.setting-list`.
  - `.stat` – Kennzahl-Karte mit nativem `<meter>`; rot ab Grenze über `low` = `high` + `optimum="0"`.
  - `.action-card` – ganze Karte ist ein `<button>`, Icon-Kachel + Titel + Untertitel.
  - `.card-grid` – Karten nebeneinander, bricht auf schmalen Bildschirmen um.
  - `.avatar` – quadratisches Initial für Spieler.
- **Web Components** (Light DOM, registrieren sich beim Import, gesammelt in `js/components/index.js`):
  - `<mc-field label help error>` – Label/Hilfe/Fehler, verdrahtet `for`, `aria-describedby`, `aria-invalid`; Fehler per `el.error = '…'`.
  - `<mc-toggle checked disabled name value description layout="row">` – `<button role="switch">`, form-associated, feuert `change`. `layout="row"` = große Einstellungszeile (52 × 28) aus Mockup 04.
  - `<mc-stepper>` – umschließt `<input type="number">`, −/+ an min/max gesperrt.
  - `<mc-range>` – umschließt `<input type="range">`, füllt die Spur, schreibt Wert in `<output for>`.
  - `<status-badge status="online|offline|starting|stopping">` – Text + Form-Marker, `role="status"`.
  - `<lang-switch>` – Sprachumschalter aus `LOCALES`, native Radios als Segment-Schalter.
  - `<log-view limit live>` – Konsolenausgabe, `el.add(lines)`; Spalten per Subgrid, `.log--truncate` für einzeilige Vorschau.

### App-Shell (`index.html`, `css/layout.css`)
- Sidebar 240 px, von oben nach unten (AGENTS.md §1):
  1. Logo 40 px, Schriftzug und Servername (`#server-name`).
  2. Adress-Box (`#server-address`).
  3. Navigation.
  4. Fuß mit Sprachumschalter und Namensnennung.
  Servername und Adresse zeigen Platzhalter (`[SERVER NAME]`, `[IP ADRESS:PORT]`), bis das Backend sie liefert.
- Unter 900 px: Topbar mit Menü-Button, Sidebar gleitet über den Inhalt (`.app[data-nav-open]`).
  Schließen per Escape, Klick auf den Hintergrund oder Navigation; Fokus wandert in die Nav bzw. zurück zum Button.
- Seiten in `js/pages/` exportieren `titleKey` und `render(root)` (optional Rückgabe einer Cleanup-Funktion).
  Unbekannte Hashes → `#/home`. Nach Navigation Fokus auf `<h1>`.
- Pflicht-Namensnennung **unten in der Sidebar** (breite Bildschirme, dort immer sichtbar) und als **Footer unter
  dem Inhalt** auf schmalen Bildschirmen, wo die Sidebar eingeklappt ist. Je Breite ist genau eine davon sichtbar.

### Versionierung
- Semantic Versioning, aktuell **`0.1.0-alpha.2`**. Quelle: `package.json`; Kopie für den Browser in `public/js/version.js`
  (beide gemeinsam ändern). Anzeige im Footer neben „Powered by PiSton“. Änderungen in `CHANGELOG.md`.
- Fahrplan: `0.1.0-alpha.N` (je abgeschlossener Frontend-Phase +1) → `0.1.0-beta.N` (Backend angebunden)
  → `0.1.0` (erste brauchbare Version) → `1.0.0` (stabil). Regeln: `AGENTS.md` §10 „Versionierung“.

### Sprache (i18n)
- UI-Texte zentral in `js/i18n/de.js`, Zugriff über `t('status.online')`.
  Statisches HTML: `data-i18n` (Text) bzw. `data-i18n-label` (aria-label), befüllt von `translate()`.
- Sprachen in `LOCALES` (`js/i18n/index.js`); Deutsch ist Standard und Rückfall für fehlende Schlüssel.
- Auswahl in `localStorage` (`piston.locale`), Wechsel lädt die Seite neu. Regeln: `AGENTS.md` §7 „Sprache (i18n)“.
