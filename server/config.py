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
"""Panel configuration: defaults, panel.config.json and environment variables.

Each value comes from the first of these that sets it, highest first:
environment variable (e.g. PANEL_PORT), panel.config.json (e.g. panelPort),
default in Config.
"""

import json
import os
from dataclasses import dataclass
from pathlib import Path

KEY_NAMES = {
    "mcDir": "mc_dir",
    "serviceName": "service_name",
    "rconHost": "rcon_host",
    "panelHost": "panel_host",
    "panelPort": "panel_port",
    "backupDir": "backup_dir",
}

ENV_KEYS = {
    "MC_DIR": "mc_dir",
    "MC_SERVICE": "service_name",
    "RCON_HOST": "rcon_host",
    "PANEL_HOST": "panel_host",
    "PANEL_PORT": "panel_port",
    "BACKUP_DIR": "backup_dir",
}


class ConfigError(Exception):
    """Raised when the panel configuration is invalid."""


@dataclass(frozen=True)
class Config:
    """Settings of the panel, built once at start and never changed."""

    mc_dir: Path = Path("/opt/minecraft")
    service_name: str = "minecraft.service"
    rcon_host: str = "127.0.0.1"
    panel_host: str | None = None
    panel_port: int = 8080
    backup_dir: Path = Path("/opt/minecraft/backups")


def load_config(path: Path) -> Config:
    """Load the panel configuration from a JSON file and the environment.

    Environment variables override the file, the file overrides the
    defaults. A missing file or key keeps the default; an unknown key in
    the file raises ConfigError.
    """
    config_dict: dict = {}
    _load_config_file(path, config_dict)
    _apply_env(config_dict)
    _convert_types(config_dict)
    return Config(**config_dict)


def _load_config_file(path: Path, config_dict: dict) -> None:
    """Copy the values from the JSON file into config_dict.

    Keys are renamed from camelCase to the field names via KEY_NAMES.
    A missing file adds nothing; an unknown key raises ConfigError.
    """
    try:
        with open(path, encoding="utf-8") as file:
            data = json.load(file)
    except FileNotFoundError:
        return
    for key, value in data.items():
        if key not in KEY_NAMES:
            raise ConfigError(f"Unbekannter Schlüssel in {path}: {key}")
        config_dict[KEY_NAMES[key]] = value


def _apply_env(config_dict: dict) -> None:
    """Copy the environment variables from ENV_KEYS into config_dict.

    Only variables that are set are copied; they override values from
    the file. The values stay strings, _convert_types() converts them.
    """
    for key, field in ENV_KEYS.items():
        if key in os.environ:
            config_dict[field] = os.environ[key]


def _convert_types(config_dict: dict) -> None:
    """Convert the values in config_dict to the types of Config, in place.

    Paths become Path, the port becomes int. Fields that are not in
    config_dict are left out, so Config uses its defaults for them.
    Invalid values raise ConfigError.
    """
    if "mc_dir" in config_dict:
        config_dict["mc_dir"] = _parse_path(
            config_dict["mc_dir"], "mcDir / MC_DIR"
        )
    if "backup_dir" in config_dict:
        config_dict["backup_dir"] = _parse_path(
            config_dict["backup_dir"], "backupDir / BACKUP_DIR"
        )
    if "panel_port" in config_dict:
        config_dict["panel_port"] = _parse_port(config_dict["panel_port"])


def _parse_port(value: object) -> int:
    """Return the port from a config value as int.

    The value comes from the panel.config.json or the environment.
    Raise ConfigError if the value is not an int or str,
    cannot be converted to an int, or is outside 1–65535.
    """
    if isinstance(value, bool) or not isinstance(value, (str, int)):
        raise ConfigError(
            "Es wurde in panelPort / PANEL_PORT "
            f"kein gültiger Port hinterlegt: {value}"
        )
    try:
        port = int(value)
    except ValueError as error:
        raise ConfigError(
            "Der angegebene Port in panelPort / PANEL_PORT "
            "ist keine Zahl: "
            f"{value}"
        ) from error
    if not 1 <= port <= 65535:
        raise ConfigError(
            "panelPort / PANEL_PORT muss eine Zahl zwischen "
            f"1 und 65535 sein, nicht: {value}"
        )
    return port


def _parse_path(value: object, key: str) -> Path:
    """Return the path from a config value as Path.

    The value comes from the panel.config.json or the environment;
    key names the field in the error message.
    Raise ConfigError if the value is not a str or not an absolute path.
    """
    if not isinstance(value, str):
        raise ConfigError(
            f"Der angegebene Pfad in {key} ist kein gültiger Pfad: {value!r}"
        )
    path = Path(value)
    if not path.is_absolute():
        raise ConfigError(
            f"Der angegebene Pfad in {key} ist nicht absolut: {value!r}"
        )
    return path


if __name__ == "__main__":
    print(load_config(Path("panel.config.example.json")))
