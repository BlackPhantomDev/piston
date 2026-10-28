# PiSton – Fortschritt

Stand: 28.10.2026 · letzter Commit `870c033` · **noch nicht gepusht**

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

## Offene Punkte / bekannte Probleme

- **Repo-Umzug:** Repo liegt im Synology-Drive-Ordner (macOS File Provider, Ausschluss nicht möglich).
  Führt zu Dateirechte-Änderungen (z. B. `public/main.css` 644 → 755) und ist riskant für `.git/`.
  Plan: Repo nach außerhalb des Sync-Ordners kopieren/klonen. **Vorher pushen.**
- **Gitignored, geht bei frischem Klon verloren:** `AGENTS.md`, `design/` – und `.gitignore` ignoriert sich selbst.
  Beim Umzug von Hand mitkopieren oder entscheiden, ob sie ins Repo gehören.
- `index.html` lädt `js/main.js` noch nicht → Komponenten dort noch nicht aktiv.
- `index.html`: Favicon-`type` ist `image/x-icon`, sollte `image/svg+xml` sein.
- Platzhalterfarbe `#757575` (aus den Mockups) hat auf `#18191B` nur ~3,8:1 Kontrast (< 4,5:1 laut AGENTS.md).
- Fonts liegen als TTF vor; WOFF2 würde ~60–70 % sparen.
- `README.md` ist leer – fehlt: Beschreibung, Copyright/Lizenz, Mojang-Disclaimer, Sicherheitshinweis (AGENTS.md §1, §8).
- Noch kein `package.json` (später `"type": "module"`, `"license": "AGPL-3.0-or-later"`), keine Tests.
- AGENTS.md §4 beschreibt noch die Soll-Struktur, nicht den Ist-Zustand oben.
- Komponenten wurden nur vom Menschen visuell geprüft, nicht automatisiert getestet.

## Nächste Schritte

1. Pushen, Repo aus dem Sync-Ordner umziehen.
2. Layout: Sidebar (Logo 40 px + Schriftzug + Servername), Hash-Routing `#/home`, `#/konsole`, `#/einstellungen`; Pflicht-Namensnennung in Sidebar/Footer.
3. Anbieter-Karten (Vanilla / Paper / Fabric, Forge/NeoForge deaktiviert) aus Mockup 04.
4. Backend nach AGENTS.md §12: `package.json`, `server/config.js`, statischer HTTP-Server für `public/`, dann `properties.js` mit Tests.
