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
"""Load panel configuration from JSON file."""

import json
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


@dataclass(frozen=True)
class Config:
    mc_dir: Path = Path("/opt/minecraft")
    service_name: str = "minecraft.service"
    rcon_host: str = "127.0.0.1"
    panel_host: str | None = None
    panel_port: int = 8080
    backup_dir: Path = Path("/opt/minecraft/backups")


def load_config(path: Path) -> Config:
    """Load every key from the config file.

    Missing keys are replaced with default values;
    unknown keys trigger a ValueError;
    a missing file also sets the default values.
    """
    config_dict = {}
    try:
        with open(path, encoding="utf-8") as file:
            data = json.load(file)
    except FileNotFoundError:
        return Config()
    for key, value in data.items():
        if key not in KEY_NAMES:
            raise ValueError(f"Unknown key in {path}: {key}")
        config_dict[KEY_NAMES[key]] = value
    if "mc_dir" in config_dict:
        config_dict["mc_dir"] = Path(config_dict["mc_dir"])
    if "backup_dir" in config_dict:
        config_dict["backup_dir"] = Path(config_dict["backup_dir"])
    return Config(**config_dict)


if __name__ == "__main__":
    print(load_config(Path("panel.config.example.json")))
