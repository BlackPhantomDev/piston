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
"""
Tests if versions in pyproject.toml and version.js match.
Tests if the version string is in the right format.
"""

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from release import read_version, to_pep440  # noqa: E402


class VersionTest(unittest.TestCase):
    def test_versions(self) -> None:
        try:
            read_version()
        except SystemExit as error:
            self.fail(str(error))

    def test_to_pep440(self) -> None:
        pairs = [
            ("0.1.0-alpha.11", "0.1.0a11"),
            ("0.2.0-beta.1", "0.2.0b1"),
            ("0.2.0-rc.2", "0.2.0rc2"),
            ("1.0.4", "1.0.4"),
        ]

        for given, expected in pairs:
            with self.subTest(given=given):
                self.assertEqual(to_pep440(given), expected)

    def test_wrong_versioning(self) -> None:
        wrong_versioning = [
            "0.1.0-gamma.11",
            "0.2.0-beta",
            "v0.2.0",
            "1.0",
        ]

        for version in wrong_versioning:
            with self.subTest(version=version):
                with self.assertRaises(SystemExit):
                    to_pep440(version)
