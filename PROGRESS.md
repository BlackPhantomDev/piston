# PiSton – Fortschritt

Stand: 28.10.2026 · letzter Code-Commit `11faa81` · **noch nicht gepusht** (gepusht bis `010ef42`)

Übergabe-Notiz für die nächste Session. Verbindliche Projektregeln stehen in `AGENTS.md`,
die Commit-Konvention in der globalen `~/.claude/CLAUDE.md`.

---

## Erledigt

| Commit | Inhalt |
|---|---|
| `e6787c6` | Frontend-Dateien (`index.html`, `css/`, `js/`, `assets/`) unverändert nach `public/` verschoben |
| `d4f7124` | Lizenz: `LICENCE` (AGPL-3.0, Originaltext), `ADDITIONAL_TERMS` (§7-Zusatzbedingungen), `THIRD-PARTY-NOTICES` (OFL-Fonts) |
| `988e7fa` | AGPL-Kopfkommentar in allen Quelldateien |
| `67d304d` | Pflicht-Footer „Powered by PiSton · Quellcode (AGPLv3)“ in `index.html` |
| `c60b872` | `css/fonts.css` – lokale Variable Fonts (Inter, JetBrains Mono, Pixelify Sans) |
| `f42cc37` | `css/tokens.css` – alle Design-Tokens aus `design/mockups/01-Styleguide.svg` |
| `3391b01` | `css/style.css` – Grundstile (Reset, Typo, Fokus, Links, Utilities) |
| `f6b7032` | `css/components.css` – Styles aller Basis-Komponenten |
| `066e13e` | Web Components + i18n (`js/components/`, `js/i18n/`) |
| `c089555` | `main.css` als CSS-Einstieg (importiert fonts, style, tokens, components) |
| `870c033` | `components.html` – Übersichtsseite aller Komponenten und Zustände |
| `010ef42` | `PROGRESS.md` |
| `ecdcb50` | `css/layout.css` + Layout-Tokens (App-Shell) |
| `bdd4a08` | i18n: `LOCALES`, Rückfall auf Deutsch, `setLocale()`, `translate()` für `data-i18n` |
| `be16173` | `js/router.js` (Hash-Routing) + Seiten-Platzhalter in `js/pages/` |
| `1ab9235` | `<lang-switch>` (Sprachumschalter, Englisch „geplant“) |
| `11faa81` | App-Shell in `index.html`: Sidebar, Topbar, `js/nav.js`, Verdrahtung in `main.js` |

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

### Ordnerstruktur (Ist-Zustand, weicht von AGENTS.md §4 ab)
Bewusst so belassen – vorhandene Dateien wurden nur nach `public/` verschoben, nicht umbenannt:

| AGENTS.md | tatsächlich |
|---|---|
| `public/fonts/` | `public/assets/fonts/` |
| `public/brand/` | `public/assets/logo/` |
| `public/css/base.css` | `public/css/style.css` |
| `public/js/app.js` | `public/js/main.js` |
| `docs/design/` | `design/mockups/` (gitignored) |
| – | `public/main.css` (CSS-Einstieg, `@import` aller Stylesheets) |
| `public/js/app.js` (Routing) | `public/js/router.js` + `public/js/nav.js`, verdrahtet in `main.js` |
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
- UI-Texte zentral in `js/i18n/de.js`, Zugriff über `t('status.online')` aus `js/i18n/index.js`.
  Statisches HTML: `data-i18n="nav.home"` (Text) bzw. `data-i18n-label` (aria-label), befüllt von `translate()`.

### App-Shell (`index.html`, `css/layout.css`)
- Sidebar 240 px nach Mockup 02: Logo 40 px + Schriftzug + Servername (`#server-name`), Nav, Adresse-Box (`#server-address`).
  Servername und Adresse zeigen Platzhalter (`[SERVER NAME]`, `[IP ADRESS:PORT]`), bis das Backend sie liefert.
- Unter 900 px: Topbar mit Menü-Button, Sidebar gleitet über den Inhalt (`.app[data-nav-open]`).
  Schließen per Escape, Klick auf den Hintergrund oder Navigation; Fokus wandert in die Nav bzw. zurück zum Button.
- Hash-Routing `#/home`, `#/konsole`, `#/einstellungen`; Unbekanntes → `#/home`. Seiten in `js/pages/`
  exportieren `titleKey` und `render(root)` (optional Rückgabe einer Cleanup-Funktion). Nach Navigation Fokus auf `<h1>`.
- Sprachumschalter `<lang-switch>` unter der Adresse-Box (Vorbereitung): Sprachen in `LOCALES` (`js/i18n/index.js`),
  Englisch ist als „geplant“ deaktiviert. Regeln dazu in AGENTS.md §7 „Sprache (i18n)“.
- Pflicht-Namensnennung als Footer **in der Inhaltsspalte** – so ist sie auch auf schmalen Bildschirmen
  sichtbar, wenn die Sidebar eingeklappt ist.

## Offene Punkte / bekannte Probleme

- **Gitignored, geht bei frischem Klon verloren:** `AGENTS.md`, `design/` – und `.gitignore` ignoriert sich selbst.
  Entscheiden, ob sie ins Repo gehören. (Repo liegt seit 28.10. unter `~/dev.local/piston`, außerhalb des Sync-Ordners.)
- Seiten sind nur Platzhalter („Inhalt folgt.“).
- Englische Übersetzung fehlt: `js/i18n/en.js` anlegen und in `LOCALES` eintragen, dann ist der Umschalter aktiv.
- Platzhalterfarbe `#757575` (aus den Mockups) hat auf `#18191B` nur ~3,8:1 Kontrast (< 4,5:1 laut AGENTS.md).
- Fonts liegen als TTF vor; WOFF2 würde ~60–70 % sparen.
- `README.md` ist leer – fehlt: Beschreibung, Copyright/Lizenz, Mojang-Disclaimer, Sicherheitshinweis (AGENTS.md §1, §8).
- Noch kein `package.json` (später `"type": "module"`, `"license": "AGPL-3.0-or-later"`), keine Tests.
- AGENTS.md §4 beschreibt noch die Soll-Struktur, nicht den Ist-Zustand oben.
- Komponenten wurden nur vom Menschen visuell geprüft, nicht automatisiert getestet.

## Nächste Schritte

1. Pushen.
2. Anbieter-Karten (Vanilla / Paper / Fabric, Forge/NeoForge deaktiviert) aus Mockup 04.
3. Backend nach AGENTS.md §12: `package.json`, `server/config.js`, statischer HTTP-Server für `public/`, dann `properties.js` mit Tests.
