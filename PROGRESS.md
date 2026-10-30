# 🗺️ PiSton – Roadmap

**Stand:** 30.10.2026 · **Version:** `0.1.0-alpha.6` · **Aktuelle Phase:** 6 – Backend-Grundgerüst

```
Frontend  ▰▰▰▰▰▰  6 von 6 Phasen
Backend   ▱▱▱▱▱▱  0 von 6 Phasen
```

Übergabe-Notiz für die nächste Session. Verbindliche Projektregeln stehen in `AGENTS.md`,
die Commit-Konvention in der globalen `~/.claude/CLAUDE.md`.

> [!TIP]
> **Als Nächstes**
> Das Frontend ist fertig. Weiter mit Phase 6: Python-Backend-Grundgerüst (venv, `config.py`, `app.py`, `properties.py`)

> [!NOTE]
> **Reihenfolge: erst das Frontend, dann das Backend.** Alle Seiten entstehen zuerst vollständig mit
> Beispieldaten. Das Backend ersetzt danach Seite für Seite die Beispieldaten durch echte – die Seiten selbst
> sollen sich dabei kaum ändern.

> [!IMPORTANT]
> **Die Demo bleibt im Repo.** Beispieldaten (`js/mock/`) und die Demo-Umsetzung (`js/api/demo.js`) werden nie
> gelöscht. `js/api.js` wählt mit einer Zeile zwischen Demo und Live-Backend (`js/api/live.js`, ab Phase 7).
> `python3 scripts/build_dist.py` baut immer die Demo nach `dist/` – mit `?sim=lost` für eine abgebrochene
> Verbindung, `?sim=error` für Fehlermeldungen und `?sim=eula` für eine noch nicht akzeptierte EULA.
> Der Parameter darf vor oder hinter dem `#` stehen; hinter dem `#` einer offenen Seite lädt die Demo dafür neu.
> So gibt es nach jeder Änderung eine aktuelle Demo, ohne zweiten Branch.

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
| 2 | [Home (UI)](#phase-2--home-ui) | Datenschicht mit Beispieldaten, Home-Seite | ✅ |
| 3 | [Konsole (UI)](#phase-3--konsole-ui) | Log-Ansicht, Filter, Befehlseingabe | ✅ |
| 4 | [Einstellungen (UI)](#phase-4--einstellungen-ui) | Properties-Formular, Spielerlisten, Versionswechsel | ✅ |
| 5 | [Feinschliff](#phase-5--feinschliff) | Zustände, schmale Bildschirme, Barrierefreiheit, EULA | ✅ |
| | **Backend** | | |
| 6 | [Backend-Grundgerüst](#phase-6--backend-grundgerüst) | Python-Server (aiohttp), Konfiguration, `server.properties`-Parser | 🚧 |
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
- **EULA:** Ein Minecraft-Server startet erst, wenn in `eula.txt` `eula=true` steht. PiSton setzt das **nie
  selbst**, auch nicht nebenbei bei einem Versionswechsel oder bei der Einrichtung.
  - Der Nutzer bestätigt ausdrücklich, immer mit einem Link zur EULA (`https://aka.ms/MinecraftEULA`):
    - im Panel mit einer Checkbox, die nie vorausgewählt ist,
    - später auch im Installer, mit einem eingetippten „ja“ (Standard „nein“).
  - Nichts überspringt die Bestätigung, auch keine Option oder Umgebungsvariable.
- **Weiterverbreitung:** Die Guidelines verbieten, das Spiel oder Spieldateien weiterzugeben.
  - Keine `server.jar` und keine anderen Spieldateien im Repo, in Releases oder in einem fertigen Pi-Image.
  - Das Backend lädt die Jar immer direkt vom Anbieter. Für Vanilla ist das Mojangs Versions-Manifest,
    die SHA1-Prüfsumme wird geprüft (AGENTS.md §6.5).

### Checkliste

- [x] Name „PiSton“ geprüft, „Minecraft“ kommt im Namen nicht vor
- [x] „Minecraft“ und „Raspberry Pi“ nur beschreibend:
      Tagline, README, `pyproject.toml`, im UI das Feld „Minecraft-Version“ und der EULA-Hinweis
- [x] Disclaimer im README
- [x] Version wechseln ist gesperrt, solange die EULA nicht akzeptiert ist. Es gibt einen Prüfpunkt mit Link zur EULA.
- [x] **Logo überarbeitet:** Der alte Würfel-Sockel erinnerte an den Minecraft-Kolben.
  - Jetzt: Zylinder als Sockel, Kolbenstange, runder grüner Kopf mit π.
  - Die Logo-Dateien in `public/assets/logo/` sind neu erzeugt.
  - Neu ist die helle Variante `piston-logo-light(-512)` für hellen Grund.
- [x] README-Logo per `<picture>` + `prefers-color-scheme`: GitHub zeigt im hellen Modus `piston-logo-light.svg`,
      im dunklen `piston-logo.svg` (AGENTS.md §1)
- [x] **EULA bestätigen im UI** (Phase 5, `js/eula.js`):
  - Karte „Minecraft-EULA akzeptieren“, solange `eula.txt` nicht `true` ist: auf Home unter dem Kopf und in den Einstellungen.
  - Link zur EULA (neuer Tab, angesagt), Checkbox (nie vorausgewählt) und Button „Akzeptieren“.
    Ohne Haken: Fehler an der Checkbox, Fokus dorthin. Erst dann `api.acceptEula()` (später `POST /api/eula`).
  - Danach: „EULA akzeptiert. Der Server kann jetzt starten.“ – bekommt den Fokus und bleibt bis zum Seitenwechsel.
  - Ohne EULA ist „Starten“ gesperrt; das Backend lehnt den Start auch selbst ab (`eula_not_accepted`).
  - Zum Vorführen: `?sim=eula` (Server offline, EULA offen). Mit `?sim=eula,error` scheitert das Akzeptieren.
  - Bleibt nötig, auch wenn später der Installer fragt: bei Installation von Hand, Installer ohne Terminal,
    „nein“ im Installer oder einem neuen Server-Ordner mit `eula=false`.
- [x] `.gitignore`: `*.jar` ausschließen, damit keine Server-Jar versehentlich im Repo landet.
      Gilt bisher nur lokal, weil `.gitignore` selbst nicht im Repo ist (siehe Offene Punkte).
- [ ] **EULA-Endpunkt** (Phase 9): `POST /api/eula` schreibt `eula=true` nur auf die ausdrückliche Bestätigung aus dem UI.
      Steht als Entwurf in AGENTS.md §9.
- [ ] **Release** (Phase 11):
  - [ ] Das Image und die Installation enthalten keine Spieldateien.
  - [x] Das README erklärt, dass die Jar direkt vom Anbieter geladen wird (Abschnitt Requirements, `0.1.0-alpha.3`).
  - [x] Das README erklärt, dass der Nutzer die EULA selbst akzeptiert (ebenda).
  - [ ] Der Disclaimer steht auch in den Release-Notes bzw. in der Beschreibung des Images.

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

✅ abgeschlossen

- [x] Boxen: `.card` (+ Kopf, Body, Liste, Outline), `.stat`, `.action-card`, `.card-grid`
- [x] `js/api.js` – Schnittstelle der Seiten zu den Daten (später `fetch` + WebSocket nach AGENTS.md §9)
- [x] `js/mock/` – Beispieldaten im Format der geplanten API-Antworten, inkl. simulierter Live-Updates
- [x] Seitenkopf: Status-Badge + „Vanilla 26.3 · läuft seit …“
- [x] Kennzahl-Karten: Spieler, TPS, Arbeitsspeicher, CPU (mit Balken)
- [x] Spielerliste mit Dimension, Ping und „OP“ (Online-Zeit bewusst weggelassen), im Kopf „6 online“
- [x] Spielerliste wird an Ort und Stelle aktualisiert: Fokus und offenes Menü überstehen das Status-Update alle 5 s
- [x] Leere Spielerliste: „Gerade ist niemand online.“ bzw. „Der Server läuft nicht.“
- [x] Aktionsmenü je Spieler (`<action-menu>`):
  - Nachricht senden (`tell`, Dialog)
  - Zum Operator machen / Operator-Rechte entziehen (`op` / `deop`)
  - Kicken und Bannen, beide mit Bestätigung
  - Fliegt ein Spieler raus, wandert der Fokus zur nächsten Zeile.
- [x] Letzte Konsolenausgabe (Ausschnitt) mit `<log-view>`
- [x] Schnellaktionen: Welt speichern, Backup erstellen, Nachricht an alle (Dialog), Tag setzen
- [x] Gliederung: Server-Monitoring, System-Monitoring, Spieler + Konsole, Schnellaktionen
- [x] Start / Stopp / Neustart (Buttons je nach Status, im Mock mit Übergängen)
- [x] Servername + Adresse in der Sidebar aus `api.js` (Felder `name`, `address` in `Status`; Quelle im Backend noch offen)

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

✅ abgeschlossen

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
- [x] Abschnitt „Spielerlisten“ (nicht im Mockup), außerhalb des Formulars:
  - Whitelist, Operatoren und Gebannt als Chips mit Anzahl.
  - Hinzufügen per Name, beim Bannen mit optionalem Grund; Entfernen je Zeile.
  - Prüfung des Namens (3–16 Zeichen) und doppelter Einträge.
  - Gilt sofort, ohne Speichern; während Start/Stopp gesperrt.
  - Hinweis, wenn die Whitelist ausgeschaltet ist.
- [x] Beispieldaten: eine gemeinsame Quelle für OPs und Banns (`js/mock/lists.js`).
      Home, Konsole und Einstellungen zeigen denselben Stand.
- [x] Warnung bei ungespeicherten Änderungen auch beim Seitenwechsel im Panel
  - Gilt für Links und für Zurück/Vor im Browser.
  - Umsetzung: `onBeforeLeave()` in `router.js`.
  - Abbrechen macht den Schritt im Verlauf rückgängig, ohne doppelte Einträge.

## Phase 5 – Feinschliff

✅ abgeschlossen

- [x] Zustände auf allen Seiten
  - **Panel nicht erreichbar** (Mockups 06, `js/connection-view.js`):
    - A: In den ersten 10 s nur ein Banner, die Seite ist abgedunkelt und gesperrt (`inert`).
    - B/C: Danach der Screen mit Countdown (5 → 10 → 20 → 30 s), Versuchszähler, „Jetzt erneut versuchen“ und Prüfliste.
      Kopierbare Befehle, Gerätename aus dem Status (`host`).
    - D: „Verbindung wiederhergestellt“, die Seite ist wieder da, wie sie war (ungespeicherte Einstellungen bleiben).
    - Die Sidebar bleibt bedienbar, die Adresse heißt dann „zuletzt bekannt“.
    - Zum Vorführen: `index.html?sim=lost` (Ausfall nach 3 s, der 4. Versuch klappt).
  - **Lädt**: Badge „Lädt …“ statt eines geratenen „Offline“, Werte „–“, Aktionen gesperrt.
    Einstellungen bleiben gesperrt (`inert`, `aria-busy`), bis die Werte da sind. Die Beispieldaten kommen dafür mit 300 ms Verzögerung.
  - **Server offline**: RAM und CPU zeigen „–“ statt 0.
  - **Leer**: Konsole „Noch keine Ausgabe.“ bzw. „Keine Zeile passt zu Filter oder Suche.“; „Keine Versionen verfügbar“.
- [x] Fehlermeldungen im Format `{ error: { code, message } }` anzeigen:
  - Vertrag: Jede Funktion in `js/api.js` lehnt bei einem Fehler mit `ApiError` (`code`, `message`) ab (`js/api/error.js`).
    Angezeigt wird `message` vom Backend; für eine zweite Sprache später über `code` nachschlagen (`errorText()` in `js/errors.js`).
  - Wo es steht – immer mit Icon und Text, nie nur Farbe:
    - Einstellungen: Speicherleiste („Nicht gespeichert: …“), unter den Schritten des Versionswechsels
      (der Schritt, an dem es scheiterte, bekommt ✕), Gefahrenzone, unter dem Formular der Spielerlisten.
    - Konsole: eigene `ERROR`-Zeile direkt unter dem Befehl. Home: „Nachricht an alle“ bleibt offen, der Text bleibt stehen.
    - Alles ohne eigenen Platz (Starten/Stoppen, Backup, Schnellaktionen, Spielermenü): Meldung unten rechts.
      Sie bleibt, bis man sie schließt oder die Seite wechselt; höchstens drei, gleiche nur einmal.
    - Nicht geladen (Einstellungen, Spielerlisten, Versionen): Kasten mit Grund und „Erneut versuchen“ an der Stelle des Inhalts.
  - Zum Vorführen: `?sim=error` (`js/mock/errors.js`) – jede Änderung schlägt fehl, jedes Laden beim ersten Mal.
    Kombinierbar: `?sim=lost,error`.
  - Geprüft mit axe in allen Fehlerzuständen, auch auf dem Handy.
- [x] Schmale Bildschirme: alle Seiten von 320 bis 1280 px geprüft, keine ist breiter als der Bildschirm.
  - Ursache war ein Seitenraster mit `auto`-Spalte: Gekürzte Zeilen (lange Spielernamen) zählten mit ihrer vollen Breite.
    Jetzt `minmax(0, 1fr)` für `.page` und `.page__narrow`.
  - Speicherleiste bei 320 px: Die Button-Beschriftung darf zweizeilig werden.
  - Die Seite hinter der offenen Sidebar scrollt nicht mehr, die Sidebar bleibt oben.
- [x] Adresse in der Sidebar kopieren:
  - Button mit Tooltip „Adresse kopieren“ und grüner Bestätigung „In die Zwischenablage kopiert“.
  - Ohne HTTPS (normal im LAN) per `execCommand`; klappt beides nicht, wird die Adresse markiert (`js/clipboard.js`).
- [x] Barrierefreiheit: geprüft mit axe-core (WCAG 2.2 AA + Best Practices) auf allen Seiten und in 15 Zuständen
      (Menü offen, Dialoge, Fehler im Formular, Sidebar auf dem Handy, Server offline) – keine Verstöße mehr.
  - Tastatur: Jeder Tab-Stopp hat einen sichtbaren Fokus (Home 21, Konsole 23, Einstellungen 50 Stopps).
  - Neu: Link „Zum Inhalt springen“ als erster Tab-Stopp. Er springt zur `<h1>`, die Route im Hash bleibt.
  - Konsole: `role="log"` sitzt auf `<log-view>` statt auf dem `<ol>`, damit die Zeilen eine Liste bleiben.
  - Platzhalterfarbe `#8A8884` (5:1 statt 3,8:1).
  - Schritte beim Versionswechsel: „erledigt“ jetzt mit ✓, nicht nur grün (WCAG 1.4.1).
  - Windows-Kontrastmodus (`forced-colors`): Gewählte Chips, Sprache, Anbieter, aktuelle Seite und Schalter bekommen
    Systemfarben; Eingabefelder zeigen den Fokus per Outline, weil der Kontrastmodus `box-shadow` entfernt.
- [x] `<lang-switch>`: Das `fieldset` hat ein unsichtbares `aria-label` („Sprache“), die Legend fehlt ja.
- [x] EULA im Panel bestätigen – Details unter [Rechtliches](#rechtliches--marke-eula-weiterverbreitung)
- [x] Nach Mockup 06 (Handy): Sprachumschalter in der Topbar rechts vom Logo, Servername auf Home in der Statuszeile
- [x] TPS auf Home mit Unterzeile wie im Mockup 02: „Ziel 20 · flüssig“ (ab 19), „etwas verzögert“ (ab 15),
      „stark verzögert“ (darunter); ohne Wert nur „Ziel 20“
- [x] Checkbox: Das Kästchen wird nicht mehr schmal gedrückt, wenn der Text zweizeilig umbricht.
- [x] Komponenten-Übersicht (`components.html`) um alle neuen Bausteine ergänzt:
  - Lädt jetzt `main.css` wie das Panel, also auch `layout.css`.
  - Neue Abschnitte: Auswahl, Status & Fortschritt, Menü/Dialog/Kopieren, Fehler, Verbindung zum Gerät.
    Dazu Listen mit Hinzufügen, Gefahrenzone, Info-Pill, Badge „Lädt …“ und der Skip-Link.
  - Menü, Dialog, Kopieren, „Erneut versuchen“ und die Meldung unten rechts funktionieren dort echt.
  - Geprüft mit axe bei 1440 und 375 px.

## Phase 6 – Backend-Grundgerüst

- [x] **Demo dauerhaft im Repo** statt einer Kopie (vorgezogen):
  - `js/api.js` ist nur noch die Schnittstelle (Typen) plus `export * from './api/demo.js'`.
  - `js/api/demo.js` enthält die Umsetzung auf den Beispieldaten in `js/mock/`, inklusive `?sim=lost`, `?sim=error` und `?sim=eula`.
  - `scripts/build_dist.py` (Python, nur Standardbibliothek) baut die Demo nach `dist/` und stellt `api.js` dort
    immer auf die Demo – egal, worauf das Repo gerade zeigt.
- [x] `pyproject.toml` (Version in PEP-440-Form `0.1.0a6`, Lizenz, `requires-python = ">=3.11"`) – vorgezogen,
      ersetzt die frühere `package.json`
- [ ] venv (`python3 -m venv .venv && .venv/bin/pip install -e .`), `aiohttp` als einzige Abhängigkeit in `pyproject.toml`
- [x] `.gitignore`: `.venv/`, `__pycache__/` – nur lokal, solange `.gitignore` selbst nicht im Repo ist (siehe Offene Punkte)
- [ ] `tests/test_version.py`: `public/js/version.js` = `version` aus `pyproject.toml` (nach Umrechnung PEP 440 ↔ SemVer),
      Aufruf `python -m unittest`
- [ ] `server/` als Paket, Start mit `python -m server` (`__main__.py`)
- [ ] `server/config.py` + `panel.config.example.json`: Datei + Umgebungsvariablen, validiert
  - LAN-IP selbst ermitteln, wenn `panelHost` leer ist (Standard-Route, ohne Pakete zu senden).
  - Ohne private Adresse bricht der Start ab, kein Ausweichen auf `0.0.0.0`.
  - Log beim Start: `PiSton läuft auf http://<ip>:<port>`.
- [ ] `server/app.py`: aiohttp-App, liefert `public/` aus (AGENTS.md §5 „Auslieferung des Frontends“)
  - Reihenfolge der Routen: `/api/…`, `/ws`, `/` → `index.html`, zuletzt `add_static(…, follow_symlinks=False)`.
  - `.js` als `text/javascript`; `Cache-Control` je Ordner.
  - Path-Traversal abgelehnt (`Path.resolve()` + `is_relative_to`, AGENTS.md §8).
- [ ] `server/properties.py`: erhält Kommentare, Leerzeilen und Reihenfolge; Java-Escaping;
      atomar schreiben (`os.replace`), vorher `server.properties.bak`
- [ ] Tests: properties-Round-Trip mit Kommentaren

## Phase 7 – Konsole live

- [ ] `server/rcon.py`: eigener RCON-Client (`asyncio`-Streams, `struct`) mit Reconnect + Backoff
- [ ] `server/logwatch.py`: `latest.log` mitlesen, Log-Rotation, Puffer ~500 Zeilen
- [ ] WebSocket `/ws` und alle zustandsändernden Anfragen mit `Origin`-Prüfung.
      Der Host aus `Origin` muss gleich dem `Host`-Header sein, sonst `403` (AGENTS.md §8).
- [ ] RCON-Status („verbunden / getrennt“) ans Frontend melden und anzeigen (AGENTS.md §6.1). Im Typ `Status` gibt es dafür noch kein Feld.
- [ ] `js/api/live.js` mit denselben Funktionen wie `api/demo.js` (fetch + WebSocket), dann in `js/api.js` umstellen.
      Verbindungszustand (`onConnection`, `reconnectNow`) am echten WebSocket; `?sim=lost` gibt es nur in der Demo.
      Fehlerantworten `{ error: { code, message } }` als `ApiError` weiterreichen, wie in der Demo.
- [ ] Konsole-Seite von Beispieldaten auf echte Daten umstellen
- [ ] „Log herunterladen“: liefert bisher nur den Puffer der Ansicht. Die ganze `latest.log` kommt über `GET /api/logs/latest` (Entwurf in AGENTS.md §9).
- [ ] Tests: RCON-Paketcodierung, Log-Zeilen-Parser

## Phase 8 – Home live

- [ ] `server/service.py`: nur die drei erlaubten `systemctl`-Aufrufe, per `asyncio.create_subprocess_exec` (nie `shell=True`)
- [ ] `server/metrics.py`: Spieler, TPS, RAM, CPU (Polling ≥ 5 s, nur mit Clients)
- [ ] `GET /api/status` mit allen Feldern des Typs `Status` in `js/api.js` (inkl. `name`, `address`, `java`, `eulaAccepted`,
      `lastBackupAt`, `host` = Hostname des Geräts; `op` je Spieler aus `ops.json`), `POST /api/server/start|stop|restart`
  - JSON-Felder in camelCase, die Umwandlung von `snake_case` passiert an einer Stelle (AGENTS.md §10).
  - `address` = LAN-IP + `server-port`, also die Adresse für Mitspieler, nicht die Panel-URL.
- [ ] Home-Seite und Sidebar auf echte Daten umstellen

## Phase 9 – Einstellungen live

- [ ] `GET/PUT /api/properties` mit serverseitiger Validierung, RCON-Werte nie ans Frontend
- [ ] `GET /api/properties/defaults` für „Auf Standardwerte zurücksetzen“ (Entwurf in AGENTS.md §9)
- [ ] `GET/PUT /api/panel` für Panel-Einstellungen (RAM/-Xmx, automatischer Neustart) (Entwurf in AGENTS.md §9)
- [ ] Automatischer Neustart: Zeitplan im Backend (Timer muss sich laut AGENTS.md §2 rechtfertigen) oder per systemd-Timer
- [ ] Welt zurücksetzen: `POST /api/world/reset`, vorher Pflicht-Backup (Entwurf in AGENTS.md §9)
- [ ] Listen: `GET /api/lists`, `POST /api/lists/<list>` (Entwurf in AGENTS.md §9).
      Bei laufendem Server nur über RCON, sonst direkt in die Dateien (§6.3).
- [ ] Einstellungen-Seite auf echte Daten umstellen

## Phase 10 – Versionswechsel live

- [ ] `server/backup.py`: Welt-Backups (`tarfile`, tar.gz), Pflicht vor jedem Wechsel
  - Packen per `asyncio.to_thread()`, damit Log-Stream und WebSockets nicht stocken.
  - Beim Wiederherstellen nur `filter="data"` (AGENTS.md §8).
- [ ] `server/java.py`: installierte Java-Versionen
- [ ] Versionsvergleich für altes (`1.x.y`) und neues Schema (`26.x`) + Tests.
      Das Frontend hat ihn schon (`public/js/versions.js`: `compareVersions`, `requiredJava`).
      In Python mit denselben Regeln nachbauen, die Testfälle gelten für beide.
- [ ] Provider Vanilla, danach Paper, Fabric
  - Schnittstelle `Provider` (`typing.Protocol`) mit `list_versions()` und `resolve()`.
  - Ausgehende Anfragen über `aiohttp.ClientSession`.
  - Tests mit gemockten Antworten.
  - Downloads nur von den Hosts aus AGENTS.md §6.5, Prüfsumme muss passen.
  - Paper verlangt einen eigenen User-Agent mit Kontakt.
- [ ] `GET /api/versions` mit `&snapshots=true` (Entwurf in AGENTS.md §9)
- [ ] Ablauf mit Fortschritt per WebSocket, Rückfall auf `server.jar.prev`

## Phase 11 – Release

- [ ] Prüfen, dass `js/api.js` im Repo auf `api/live.js` zeigt. Die Beispieldaten bleiben für die Demo – das
      Live-Panel lädt sie nicht.
- [ ] `systemd/piston.service` (`ExecStart=/opt/piston/.venv/bin/python -m server`, `WorkingDirectory=/opt/piston`)
      + `sudoers-piston` (Beispiel)
- [ ] README: Installation nach `/opt/piston` mit venv (nie `--break-system-packages`)
- [ ] Screenshots

## Später / Ideen

### Wenn PiSton rundläuft (nach dem Release)

- [ ] 📦 **Installer:** ein `install.sh`, das man direkt auf dem Gerät startet, wie bei Tailscale:
      `curl -fsSL https://…/install.sh | sh`
  - Er erledigt, was die README in Phase 11 von Hand beschreibt:
    - User `minecraft` anlegen,
    - `/opt/piston` mit venv einrichten,
    - `piston.service` installieren,
    - die sudoers-Regel setzen (nur die drei `systemctl`-Befehle).
  - Reines POSIX-`sh`. Vorher prüft er das System (Raspberry Pi OS 64-bit bzw. Debian), Python ≥ 3.11 und Java.
  - Man kann ihn mehrfach ausführen, ohne dass etwas kaputtgeht. Am Ende zeigt er die Adresse `http://<ip>:8080`.
  - Danach richtet er auf Wunsch gleich den Minecraft-Server ein (nur mit Terminal):
    - Auswahl von Anbieter (Vanilla, Paper, Fabric) und Version, dieselbe Auswahl wie im Panel.
    - EULA-Frage mit Link zur EULA. Nur ein eingetipptes „ja“ zählt, Standard ist „nein“.
      Bei `curl … | sh` ist die Eingabe die Pipe, deshalb liest der Installer die Antwort von `/dev/tty`.
    - Den Download macht nicht das Skript, sondern das Backend: `python -m server setup` mit denselben
      Provider-Modulen wie das Panel (Prüfsumme, Java-Prüfung). So gibt es keine zweite Download-Logik in `sh`.
    - Ohne Terminal oder bei „nein“ übernimmt das Panel: EULA-Hinweis und Versionswechsel wie gewohnt.
  - In der README zusätzlich der vorsichtige Weg: erst herunterladen, ansehen, dann ausführen.
  - Zu klären:
    - Der Installer braucht Root-Rechte. AGENTS.md §11 erlaubt `sudo` bisher nur für die drei `systemctl`-Aufrufe.
    - Wo liegt das Skript: Release-Asset, GitHub Pages oder eigene Domain?
    - Lässt man im Installer den Server weg, gibt es noch keine Jar. Dafür braucht das Panel einen Zustand
      „noch kein Server installiert“, der bisher nicht vorgesehen ist.
- [ ] 🔔 **Update-Hinweis:** Das Panel prüft regelmäßig die Releases auf GitHub. Gibt es eine neuere Version,
      zeigt es einen Hinweis mit Link zum Repo und zu einer Update-Anleitung (die Anleitung ist noch auszuarbeiten).
  - Gefragt wird vom Backend, nicht vom Browser: einmal am Tag, mit dem PiSton-User-Agent.
    - `GET https://api.github.com/repos/BlackPhantomDev/piston/releases/latest` liefert nur stabile Versionen.
    - Wer selbst eine Vorabversion (`-alpha`, `-beta`) nutzt, bekommt auch Vorabversionen angezeigt. Dafür braucht es `/releases`.
  - Verglichen wird nach SemVer. Es gibt kein automatisches Update, nur Hinweis und Link.
  - Die Prüfung lässt sich in den Einstellungen abschalten, denn sie verrät GitHub die IP des Geräts.
  - Schlägt die Prüfung fehl (offline, Limit von 60 Anfragen pro Stunde), meldet das Panel nichts und versucht es beim nächsten Mal.
  - Zu klären: `api.github.com` muss in die Liste erlaubter Hosts (AGENTS.md §8).
    Kann der Installer auch aktualisieren, heißt die Anleitung einfach: „`install.sh` noch einmal ausführen“.
- [ ] 🔍 **Klick auf die Versionsnummer** in der Sidebar öffnet ein Fenster:
  - installierte Version und Zeitpunkt der letzten Prüfung,
  - Button „Jetzt nach Updates suchen“ für die Suche von Hand,
  - Link zu den Release-Notes.
  - Die Versionsnummer wird dafür ein Button (per Tastatur erreichbar), auch im Fuß auf schmalen Bildschirmen.
    Die Namensnennung „Powered by PiSton“ daneben bleibt unverändert sichtbar (ADDITIONAL_TERMS).

### Weitere Ideen

- 🌐 Englische Oberfläche: `js/i18n/en.js` anlegen und in `LOCALES` eintragen – der Umschalter ist schon da
- 🧩 Forge / NeoForge – bewusst nicht enthalten, nur als „geplant“ im UI
- 🚫 IP-Banns (`banned-ips.json`) – die Spielerlisten zeigen bisher nur Banns nach Name

---

## Offene Punkte & Aufräumarbeiten

- [ ] **Gitignored, fehlt bei frischem Klon:** `AGENTS.md`, `design/` – und `.gitignore` ignoriert sich selbst. Entscheiden, ob sie ins Repo gehören.
      Dringender, seit `.gitignore` auch `*.jar` und `.venv/` ausschließt: Ohne die Datei im Repo greifen diese Regeln
      bei einem frischen Klon nicht.
- [ ] `AGENTS.md` §4 beschreibt die Soll-Struktur, nicht den Ist-Zustand (siehe [Ordnerstruktur](#ordnerstruktur))
- [x] Platzhalterfarbe `#757575` hatte auf `#18191B` nur ~3,8:1 Kontrast – jetzt `#8A8884` mit 5:1
- [ ] Fonts als WOFF2 statt TTF (~60–70 % kleiner)
- [ ] Ungenutzte Font-Dateien: die `static/`-Ordner von Inter, JetBrains Mono und Pixelify Sans sowie 7 Schnitte von
      Chakra Petch (geladen werden nur Medium, SemiBold und Bold). `scripts/build_dist.py` lässt sie im `dist/` schon weg.
- [ ] „Quellcode“ in der Namensnennung steht fest im HTML (`index.html`, `components.html`). Für Englisch per `data-i18n`
      übersetzbar machen und den deutschen Text als Rückfall im HTML lassen, damit er auch ohne JS sichtbar ist.
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
- **Jede neue Quelldatei** (JS, CSS, HTML, Python) beginnt mit dem AGPL-Kopfkommentar. Vorlage: Anfang von `public/css/tokens.css`;
  in Python als `#`-Zeilen vor dem Docstring, dazu `# SPDX-License-Identifier: AGPL-3.0-or-later`.

### Backend
- **Python 3.11+ mit `asyncio`** (Entscheidung vom 29.10.2026, vorher war Node.js geplant). Auf dem Pi braucht
  PiSton damit nur Python (bei Raspberry Pi OS vorinstalliert) und Java – kein Node.js, kein npm.
- Einzige Laufzeit-Abhängigkeit: **`aiohttp`** (HTTP-Server, WebSocket, statische Dateien, ausgehende Anfragen).
  Alles andere aus der Standardbibliothek; RCON selbst gebaut. Kein FastAPI/Flask/Django.
- Installation in eine venv (`/opt/piston/.venv`), weil Raspberry Pi OS `pip install` ins System blockiert (PEP 668).
- Tests mit `unittest` (`python -m unittest`), Dateien `tests/test_*.py`.
- Nur HTTP, kein HTTPS – bewusst für den Heimgebrauch im LAN. Erreichbar per IP oder `raspberrypi.local`.
- Details und Regeln: `AGENTS.md` §2, §3, §5, §8, §10.
- `LICENCE` enthält ausschließlich den unveränderten AGPL-Text (damit GitHub die Lizenz erkennt).

### Ordnerstruktur
Ist-Zustand, weicht bewusst von `AGENTS.md` §4 ab – vorhandene Dateien wurden nur verschoben, nicht umbenannt:

| AGENTS.md | tatsächlich |
|---|---|
| `public/fonts/` | `public/assets/fonts/` |
| `public/brand/` | `public/assets/logo/` |
| `public/css/base.css` | `public/css/style.css` |
| `public/js/app.js` | `public/js/main.js` (Einstieg) + `router.js` + `nav.js` |
| `<mc-button>` in `js/components/` | – (ein `<button class="btn">` reicht) |
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
  - `.card__empty` – Hinweis statt leerer Liste; `.list-add` – Name (+ Grund) und Button in einer Zeile;
    `.list-note` – kurzer Hinweis über einer Liste; `.choice-chip__count` – Anzahl im Chip.
  - `.command` – Befehl mit Kopier-Button, `.check-steps` – nummerierte Prüfliste; Kopieren mit Tooltip über
    `setupCopyButton()` aus `js/clipboard.js`.
  - `<status-badge>` kennt auch `loading` („Lädt …“, gepunkteter Marker), das ist der Standard ohne Status.
    Das Badge pulsiert mit einem Ring um die Box:
    - `online` ruhig (2 × `--pulse-calm` à 2,4 s) und `offline` schneller (4 × `--pulse-fast` à 1,2 s), jeweils 4,8 s nach
      dem Statuswechsel, dann ist Ruhe. So bleibt es unter den 5 s, die WCAG 2.2.2 ohne Pause-Möglichkeit erlaubt.
    - `starting` und `stopping` pulsieren, bis der Vorgang fertig ist, wie ein Spinner.
    - Jeder neue Status startet den Puls neu. Derselbe Status noch einmal rendert das Badge nicht neu.
    - Bei `prefers-reduced-motion` steht es still.
  - `.tooltip` – kurzer Hinweis über einem Control (`aria-hidden`, der Name kommt aus `aria-label`).
    Sichtbar bei Hover (nur wo es Hover gibt), Tastaturfokus und solange das Eltern-Element `data-state` hat.
  - Auswahl und Abläufe: `.choice-chips` (Radiogruppe oder Sprungmarken mit `aria-current`), `.option-cards`, `.chip`,
    `.check-list` (`ok`/`fail`/`info`), `.steps` (`done`/`active`/`failed`), `.option-row`, `.card--danger`, `.info-pill`.
  - Fehler, immer mit Icon und Text (`js/errors.js`): `.error-text` (Statuszeile), `.form-error` (leer unsichtbar),
    `.load-error` (mit „Erneut versuchen“), `.notice` (Meldung unten rechts in `#notices`).
  - Alle Bausteine stehen mit ihren Zuständen auf `components.html`.
- **Web Components** (Light DOM, registrieren sich beim Import, gesammelt in `js/components/index.js`):
  - `<mc-field label help error>` – Label/Hilfe/Fehler, verdrahtet `for`, `aria-describedby`, `aria-invalid`; Fehler per `el.error = '…'`.
  - `<mc-toggle checked disabled name value description layout="row">` – `<button role="switch">`, form-associated, feuert `change`. `layout="row"` = große Einstellungszeile (52 × 28) aus Mockup 04.
  - `<mc-stepper>` – umschließt `<input type="number">`, −/+ an min/max gesperrt.
  - `<mc-range>` – umschließt `<input type="range">`, füllt die Spur, schreibt Wert in `<output for>`.
  - `<status-badge status="online|offline|starting|stopping">` – Text + Form-Marker, `role="status"`.
  - `<lang-switch>` – Sprachumschalter aus `LOCALES`, native Radios als Segment-Schalter (je 44 × 44 px).
  - `<log-view limit live follow filter>` – Konsolenausgabe, `el.add(lines)`; Spalten per Subgrid,
    `.log--truncate` für einzeilige Vorschau, `.log--lg` für die Konsole.
    Mit `live` bekommt das Element selbst `role="log"`; dazu `aria-label` und, wenn es scrollt, `tabindex="0"`.
  - `<action-menu label>` – „⋯“-Button mit Menü aus den `<button value>`-Kindern (`<hr>` = Trenner, `data-danger` = rot).
    Natives Popover, Pfeiltasten/Home/End, feuert `action` mit `detail.value`. Klappt nach oben, wenn unten kein Platz ist.

### App-Shell (`index.html`, `css/layout.css`)
- Sidebar 240 px, von oben nach unten (AGENTS.md §1):
  1. Logo 40 px, Schriftzug und Servername (`#server-name`).
  2. Adress-Box (`#server-address`).
  3. Navigation.
  4. Fuß mit Sprachumschalter und Namensnennung.
  Servername und Adresse kommen aus dem Status (`main.js` abonniert `onStatus`), bis dahin steht dort „–“.
- Unter 900 px: Topbar mit Menü-Button, Sidebar gleitet über den Inhalt (`.app[data-nav-open]`).
  Schließen per Escape, Klick auf den Hintergrund oder Navigation; Fokus wandert in die Nav bzw. zurück zum Button.
  Der Sprachumschalter sitzt dort rechts in der Topbar (`.topbar__lang`); der im Sidebar-Fuß ist ausgeblendet.
- Home zeigt den Servernamen in der Statuszeile („Survival-Welt · Vanilla 26.3 · läuft seit …“): breit in einer
  Zeile, ein zu langer Name wird mit „…“ gekürzt, Version und Laufzeit bleiben; unter 900 px steht der Name darüber.
- Seiten in `js/pages/` exportieren `titleKey` und `render(root)` (optional Rückgabe einer Cleanup-Funktion).
  Unbekannte Hashes → `#/home`. Nach Navigation Fokus auf `<h1>`.
- Seiten können einen Seitenwechsel aufhalten: `onBeforeLeave(guard)` aus `router.js`, Rückgabe in der Cleanup aufrufen.
  Links werden vor dem Wechsel der URL abgefangen. Zurück/Vor macht den Schritt rückgängig, dafür steht in
  `history.state` eine laufende Nummer (`index`).
- Verbindung zum Panel weg: `js/connection-view.js` legt Banner und Screen „Panel nicht erreichbar“ über die Seite
  (Mockups 06). Die Seite bleibt im DOM (nur `hidden`/`inert`), damit Eingaben erhalten bleiben. Der Screen ist ein
  zweites `<main>`, sichtbar ist immer nur eins.
- Pflicht-Namensnennung **unten in der Sidebar** (breite Bildschirme, dort immer sichtbar) und als **Footer unter
  dem Inhalt** auf schmalen Bildschirmen, wo die Sidebar eingeklappt ist. Je Breite ist genau eine davon sichtbar.

### Versionierung
- Semantic Versioning, aktuell **`0.1.0-alpha.6`**. Quelle: `pyproject.toml` (PEP-440-Form `0.1.0a6`);
  Kopie für den Browser in `public/js/version.js` (SemVer-Form)
  (beide gemeinsam ändern). Anzeige bei der Namensnennung, also im Sidebar-Fuß bzw. auf schmalen Bildschirmen im Footer.
  Änderungen in `CHANGELOG.md`.
- Fahrplan: `0.1.0-alpha.N` (`N` +1 je getaggtem Zwischenstand, z. B. abgeschlossene Phase oder Demo-Upload)
  → `0.1.0-beta.N` (Backend angebunden, Test auf dem Pi) → `0.1.0` (erste brauchbare Version)
  → `0.x.0` (neue Funktionen) → `1.0.0` (stabil). Regeln: `AGENTS.md` §10 „Versionierung“.
- Kein `0.1.1-…` vor `0.1.0`: Die Patch-Stelle zählt Fehlerkorrekturen *nach* einem Release.
  Bis dahin zählt nur `N` hoch, auch zweistellig.

### Sprache (i18n)
- UI-Texte zentral in `js/i18n/de.js`, Zugriff über `t('status.online')`.
  Statisches HTML: `data-i18n` (Text), `data-i18n-label` (aria-label) oder `data-i18n-<attr>` (jedes andere Attribut),
  befüllt von `translate()`.
- Sprachen in `LOCALES` (`js/i18n/index.js`); Deutsch ist Standard und Rückfall für fehlende Schlüssel.
- Auswahl in `localStorage` (`piston.locale`), Wechsel lädt die Seite neu. Regeln: `AGENTS.md` §7 „Sprache (i18n)“.
