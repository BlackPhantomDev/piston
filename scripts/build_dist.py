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
what happens when the backend answers with errors.

The demo always runs on js/api/demo.js and the sample data in js/mock/,
whatever js/api.js points to in the repo – so every change to the panel
ends up in the next demo without a second branch.

What goes into dist/:
- public/ without the component overview and macOS files,
- only the fonts that css/fonts.css loads, each with its licence (OFL.txt),
- LICENCE, ADDITIONAL_TERMS and THIRD-PARTY-NOTICES.
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
