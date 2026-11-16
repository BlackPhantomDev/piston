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
"""Tests for server/config.py."""

import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from server.config import Config, ConfigError, load_config


class ConfigTest(unittest.TestCase):
    """Test load_config() with a temporary file and an empty environment."""

    def _write_config(self, data: dict) -> Path:
        """Write data as JSON to a temporary file and return its path.

        The folder is deleted after the test.
        """
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)

        file = Path(folder.name) / "data.json"
        file.write_text(json.dumps(data), encoding="utf-8")
        return file

    def test_file_overrides_default(self) -> None:
        """A value from the file overrides the default."""
        path = self._write_config({"panelPort": 5944})
        with patch.dict(os.environ, {}, clear=True):
            config = load_config(path)

        self.assertEqual(config.panel_port, 5944)

    def test_env_overrides_file(self) -> None:
        """A value from the environment overrides the file."""
        path = self._write_config({"serviceName": "server.service"})
        with patch.dict(
            os.environ, {"MC_SERVICE": "my-minecraft.service"}, clear=True
        ):
            config = load_config(path)

        self.assertEqual(config.service_name, "my-minecraft.service")

    def test_defaults(self) -> None:
        """Without file and environment, all defaults apply."""
        path = Path("not-existing.json")
        with (
            patch.dict(os.environ, {}, clear=True),
            patch(
                "server.config._detect_lan_ip", return_value="192.168.1.50"
            ) as fake,
        ):
            config = load_config(path)
        self.assertEqual(config, Config(panel_host="192.168.1.50"))
        fake.assert_called_once()

    def test_unknown_key(self) -> None:
        """An unknown key in the file raises ConfigError."""
        path = self._write_config({"boolishKey": True})
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(ConfigError):
                load_config(path)

    def test_invalid_ports(self) -> None:
        """An invalid panelPort in the file raises ConfigError."""
        wrong_ports = [
            "abc",
            True,
            99999999,
            None,
            [1],
            0,
            -3,
            2334.4,
            "23434.5",
        ]
        for value in wrong_ports:
            with self.subTest(value=value):
                path = self._write_config({"panelPort": value})
                with patch.dict(os.environ, {}, clear=True):
                    with self.assertRaises(ConfigError):
                        load_config(path)

    def test_invalid_env_ports(self) -> None:
        """An invalid PANEL_PORT in the environment raises ConfigError."""
        wrong_ports = [
            "abc",
            "99999999",
            "0",
            "-3",
            "23434.5",
            "",
        ]
        for value in wrong_ports:
            with self.subTest(value=value):
                path = self._write_config({})
                with patch.dict(os.environ, {"PANEL_PORT": value}, clear=True):
                    with self.assertRaises(ConfigError):
                        load_config(path)

    def test_invalid_paths(self) -> None:
        """A path that is not an absolute str raises ConfigError."""
        wrong_paths = [
            {"mcDir": "relativ"},
            {"backupDir": ""},
            {"mcDir": 8080},
            {"backupDir": None},
            {"mcDir": True},
        ]
        for data in wrong_paths:
            with self.subTest(data=data):
                path = self._write_config(data)
                with patch.dict(os.environ, {}, clear=True):
                    with self.assertRaises(ConfigError):
                        load_config(path)

    def test_invalid_texts(self) -> None:
        """A text field that is not a str or is empty raises ConfigError."""
        wrong_texts = [
            {"serviceName": 1},
            {"rconHost": ""},
            {"panelHost": " "},
            {"panelHost": True},
        ]
        for data in wrong_texts:
            with self.subTest(data=data):
                path = self._write_config(data)
                with patch.dict(os.environ, {}, clear=True):
                    with self.assertRaises(ConfigError):
                        load_config(path)

    def test_lan_ip_detected(self) -> None:
        """Without panelHost, the LAN IP is detected and used."""
        path = self._write_config({"panelHost": None})
        with (
            patch.dict(os.environ, {}, clear=True),
            patch(
                "server.config._detect_lan_ip", return_value="192.168.1.50"
            ) as fake,
        ):
            config = load_config(path)
        self.assertEqual(config.panel_host, "192.168.1.50")
        fake.assert_called_once()

    def test_lan_ip_not_detected(self) -> None:
        """With panelHost set, no LAN IP is detected."""
        path = self._write_config({"panelHost": "10.0.0.5"})
        with (
            patch.dict(os.environ, {}, clear=True),
            patch(
                "server.config._detect_lan_ip", return_value="192.168.1.50"
            ) as fake,
        ):
            config = load_config(path)
        self.assertEqual(config.panel_host, "10.0.0.5")
        fake.assert_not_called()
