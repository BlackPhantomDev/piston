# PiSton - A tiny web panel for your Minecraft server on a Raspberry Pi
# Copyright (C) 2026 Mischa S.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# Additional terms apply under Section 7 of the license;
# see the ADDITIONAL_TERMS file in the root of this repository.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.
#
# SPDX-License-Identifier: AGPL-3.0-or-later
"""Builds the PiSton demo into dist/: the panel on sample data, no backend needed.

    python3 scripts/build_dist.py [--out DIR]

Upload the contents of dist/ to any static web host. Adding ?sim=lost to the
address shows what happens when the connection to the device breaks, ?sim=error
what happens when the backend answers with errors, ?sim=eula a server whose
EULA is not accepted yet.

The demo always runs on js/api/demo.js and the sample data in js/mock/,
whatever js/api.js points to in the repo – so every change to the panel
ends up in the next demo without a second branch.

What goes into dist/:
- public/ without the component overview and macOS files,
- only the fonts that css/fonts.css loads, each with its licence (OFL.txt),
- LICENCE, ADDITIONAL_TERMS and THIRD-PARTY-NOTICES,
- "Rechtliches" next to the attribution, opening a dialog with imprint, privacy
  policy and trademark notices: the demo is a public website, the panel at home
  is not, so public/index.html only has placeholders for it.
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
FONTS = PUBLIC / "assets" / "fonts"
LEGAL_FILES = ("LICENCE", "ADDITIONAL_TERMS", "THIRD-PARTY-NOTICES")
SKIPPED_NAMES = {".DS_Store", "components.html"}

FONT_URL = re.compile(r'url\("\.\./(assets/fonts/[^"]+)"\)')
API_SOURCE = re.compile(r"^export \* from '\./api/\w+\.js';$", re.MULTILINE)
DEMO_SOURCE = "export * from './api/demo.js';"
VERSION = re.compile(r"VERSION = '([^']+)'")

# Legal pages of the demo – the addresses are given in AGENTS.md §1 "Website", never guess them
IMPRINT_URL = "https://pistonpanel.dev/imprint.html"
PRIVACY_URL = "https://pistonpanel.dev/privacy.html"


def _external(url: str, key: str, text: str) -> str:
    """Link that opens in a new tab and says so to screen readers."""
    return (
        f'<a href="{url}" target="_blank" rel="noopener noreferrer"><span data-i18n="{key}">{text}</span>'
        '<span class="visually-hidden" data-i18n="legal.newTab"> (öffnet in neuem Tab)</span></a>'
    )


_OPENER = (
    '<button class="legal-notice__button" type="button" aria-haspopup="dialog" data-opens="legal-dialog"'
    ' data-i18n="legal.title">Rechtliches</button>'
)
# German text is the fallback without JS; translate() swaps in the active language
_DIALOG = f"""<dialog class="dialog" id="legal-dialog" aria-labelledby="legal-title" aria-describedby="legal-text">
      <form class="dialog__form" method="dialog">
        <h2 id="legal-title" data-i18n="legal.title">Rechtliches</h2>
        <p id="legal-text" data-i18n="legal.text">Diese Demo zeigt PiSton mit Beispieldaten und steuert keinen echten Server. Für diese Seite gelten das Impressum und die Datenschutzerklärung von pistonpanel.dev.</p>
        <ul class="legal-dialog__links">
          <li>{_external(IMPRINT_URL, "legal.imprint", "Impressum")}</li>
          <li>{_external(PRIVACY_URL, "legal.privacy", "Datenschutzerklärung")}</li>
        </ul>
        <p data-i18n="legal.storage">Die Demo setzt keine Cookies und nutzt kein Tracking. Nur die gewählte Sprache bleibt in deinem Browser gespeichert.</p>
        <p data-i18n="legal.logs">Wie bei jeder Website speichert der Webserver beim Aufruf technische Zugriffsdaten in Server-Logs, etwa IP-Adresse, Zeitpunkt und aufgerufene Datei. Wie lange und wozu, steht in der Datenschutzerklärung.</p>
        <div>
          <p class="legal-dialog__fine" lang="en" data-i18n="legal.minecraft">Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</p>
          <p class="legal-dialog__fine" lang="en" data-i18n="legal.raspberryPi">Raspberry Pi is a trademark of Raspberry Pi Ltd.</p>
        </div>
        <div class="dialog__actions">
          <button class="btn btn--secondary" data-i18n="legal.close">Schließen</button>
        </div>
      </form>
    </dialog>"""
# Placeholder in public/index.html → what replaces it in dist/index.html
LEGAL = {
    "<!-- dist: legal line – the demo only, added by scripts/build_dist.py -->":
        f'<span class="legal-notice__line">{_OPENER}</span>',
    "<!-- dist: legal inline – the demo only, added by scripts/build_dist.py -->":
        f"· {_OPENER}",
    "<!-- dist: legal dialog – the demo only, added by scripts/build_dist.py -->":
        _DIALOG,
}


def build(out: Path) -> None:
    """Writes a fresh demo to out (an existing folder is replaced)."""
    out = out.resolve()
    if out in (ROOT, PUBLIC) or out.is_relative_to(PUBLIC):
        raise SystemExit(f"Refusing to build into {out}")
    if out.exists():
        shutil.rmtree(out)

    # The panel itself – fonts follow below, only the ones in use
    def skip(directory: str, names: list[str]) -> set[str]:
        skipped = {name for name in names if name in SKIPPED_NAMES}
        if Path(directory) == FONTS.parent:
            skipped.add(FONTS.name)
        return skipped

    shutil.copytree(PUBLIC, out, ignore=skip)

    fonts = sorted(set(FONT_URL.findall((PUBLIC / "css" / "fonts.css").read_text(encoding="utf-8"))))
    for font in fonts:
        target = out / font
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(PUBLIC / font, target)
    for folder in sorted({Path(font).parent for font in fonts}):
        licence = PUBLIC / folder / "OFL.txt"
        if licence.exists():
            shutil.copy2(licence, out / folder / "OFL.txt")

    for name in LEGAL_FILES:
        shutil.copy2(ROOT / name, out / name)

    # Always the demo: sample data instead of the backend
    api = out / "js" / "api.js"
    source, count = API_SOURCE.subn(DEMO_SOURCE, api.read_text(encoding="utf-8"))
    if count != 1:
        raise SystemExit(f"{api}: expected one line like {DEMO_SOURCE!r}, found {count}")
    api.write_text(source, encoding="utf-8")

    # The demo is a public website: "Rechtliches" next to the attribution (sidebar and narrow-screen footer)
    index = out / "index.html"
    html = index.read_text(encoding="utf-8")
    for placeholder, link in LEGAL.items():
        if html.count(placeholder) != 1:
            raise SystemExit(f"{index}: expected the placeholder {placeholder!r} once, found {html.count(placeholder)}")
        html = html.replace(placeholder, link)
    index.write_text(html, encoding="utf-8")

    files = [path for path in out.rglob("*") if path.is_file()]
    size_mb = sum(path.stat().st_size for path in files) / 1_000_000
    version = VERSION.search((out / "js" / "version.js").read_text(encoding="utf-8"))
    print(f"PiSton demo {version.group(1) if version else '?'} → {out}")
    print(f"{len(files)} files, {size_mb:.1f} MB, {len(fonts)} font files")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the PiSton demo (sample data, no backend).")
    parser.add_argument("--out", type=Path, default=ROOT / "dist", help="target folder (default: dist/)")
    build(parser.parse_args().out)


if __name__ == "__main__":
    sys.exit(main())
