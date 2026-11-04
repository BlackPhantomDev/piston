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
"""scripts/build_dist.py: the demo runs on sample data and has "Rechtliches" – the panel does not."""

import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from build_dist import IMPRINT_URL, LEGAL, PRIVACY_URL  # noqa: E402

I18N_KEY = re.compile(r'data-i18n="([\w.]+)"')


def has_key(source: str, key: str) -> bool:
    """True if a locale file (de.js, en.js) defines the dotted key, e.g. legal.title."""
    section, name = key.split(".")
    match = re.search(rf"^  {section}: \{{\n(.*?)^  \}},", source, re.MULTILINE | re.DOTALL)
    return bool(match and re.search(rf"^    {name}:", match.group(1), re.MULTILINE))


class BuildDistTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls._tmp = tempfile.TemporaryDirectory()
        cls.out = Path(cls._tmp.name) / "dist"
        subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "build_dist.py"), "--out", str(cls.out)],
            check=True,
            capture_output=True,
        )
        cls.html = (cls.out / "index.html").read_text(encoding="utf-8")
        cls.panel = (ROOT / "public" / "index.html").read_text(encoding="utf-8")

    @classmethod
    def tearDownClass(cls) -> None:
        cls._tmp.cleanup()

    def test_demo_opens_the_legal_dialog(self) -> None:
        # Sidebar on wide screens, footer on narrow ones – both open the same dialog
        self.assertEqual(self.html.count('data-opens="legal-dialog"'), 2)
        self.assertEqual(self.html.count('<dialog class="dialog" id="legal-dialog"'), 1)
        for placeholder in LEGAL:
            self.assertNotIn(placeholder, self.html)

    def test_imprint_and_privacy_open_in_a_new_tab(self) -> None:
        for url in (IMPRINT_URL, PRIVACY_URL):
            self.assertEqual(self.html.count(f'href="{url}" target="_blank" rel="noopener noreferrer"'), 1, url)
        self.assertEqual(self.html.count('data-i18n="legal.newTab"'), 2)

    def test_trademark_notices_in_english(self) -> None:
        self.assertIn('lang="en" data-i18n="legal.minecraft"', self.html)
        self.assertIn('lang="en" data-i18n="legal.raspberryPi"', self.html)

    def test_every_added_text_in_every_language(self) -> None:
        added = set(I18N_KEY.findall(self.html)) - set(I18N_KEY.findall(self.panel))
        self.assertTrue({"legal.privacy", "legal.storage", "legal.logs"} <= added)
        for locale in ("de", "en"):
            source = (ROOT / "public" / "js" / "i18n" / f"{locale}.js").read_text(encoding="utf-8")
            for key in sorted(added):
                self.assertTrue(has_key(source, key), f"{locale}.js: {key}")

    def test_panel_has_no_legal_dialog(self) -> None:
        self.assertNotIn(IMPRINT_URL, self.panel)
        self.assertNotIn(PRIVACY_URL, self.panel)
        self.assertNotIn("data-opens", self.panel)
        for placeholder in LEGAL:
            self.assertEqual(self.panel.count(placeholder), 1, placeholder)

    def test_demo_runs_on_sample_data(self) -> None:
        api = (self.out / "js" / "api.js").read_text(encoding="utf-8")
        self.assertIn("export * from './api/demo.js';", api)
        self.assertFalse((self.out / "components.html").exists())


if __name__ == "__main__":
    unittest.main()
