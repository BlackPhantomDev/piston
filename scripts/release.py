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
"""Tags the current version, pushes it and builds the demo into dist/.

    python3 scripts/release.py [--dry-run] [--yes]

Run it after the release commit ("chore: release X"). It does not change the
version – that stays a manual step (AGENTS.md §10 "Versionierung").

1. Checks: version.js and pyproject.toml agree, CHANGELOG.md has a section for
   the version, on branch main, nothing uncommitted, main not behind origin,
   tag not taken yet (locally or on origin).
2. Builds the demo into dist/ (scripts/build_dist.py). If that fails, nothing
   is tagged.
3. Asks, then sets the annotated tag vX ("PiSton X") and pushes main and the
   tag together (--atomic: both or neither).

--dry-run stops after the build, --yes skips the question.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
import tomllib
from pathlib import Path

from build_dist import ROOT, build

BRANCH = "main"
REMOTE = "origin"
VERSION_JS = re.compile(r"VERSION = '([^']+)'")
PRERELEASE = {"alpha": "a", "beta": "b", "rc": "rc"}


def git(*args: str, check: bool = True) -> str:
    """Runs git in the repository root and returns its output."""
    result = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)
    if check and result.returncode != 0:
        raise SystemExit(f"git {' '.join(args)} failed:\n{result.stderr.strip()}")
    return result.stdout.rstrip()


def to_pep440(semver: str) -> str:
    """0.1.0-alpha.8 → 0.1.0a8, 0.1.0-beta.1 → 0.1.0b1, 0.1.0 → 0.1.0"""
    match = re.fullmatch(r"(\d+\.\d+\.\d+)(?:-(alpha|beta|rc)\.(\d+))?", semver)
    if not match:
        raise SystemExit(f"public/js/version.js: {semver!r} is not MAJOR.MINOR.PATCH[-alpha|beta|rc.N]")
    release, kind, number = match.groups()
    return release + (f"{PRERELEASE[kind]}{number}" if kind else "")


def read_version() -> str:
    """The SemVer form from version.js, after checking pyproject.toml has the same version."""
    match = VERSION_JS.search((ROOT / "public" / "js" / "version.js").read_text(encoding="utf-8"))
    if not match:
        raise SystemExit("public/js/version.js: no VERSION found")
    semver = match.group(1)
    with (ROOT / "pyproject.toml").open("rb") as file:
        pep440 = tomllib.load(file)["project"]["version"]
    if to_pep440(semver) != pep440:
        raise SystemExit(f"Versions differ: version.js {semver}, pyproject.toml {pep440} (expected {to_pep440(semver)})")
    return semver


def check(version: str, tag: str) -> None:
    """Stops with a message when the repository is not ready for the release."""
    changelog = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
    if f"## [{version}]" not in changelog:
        raise SystemExit(f"CHANGELOG.md has no section '## [{version}]'")

    branch = git("branch", "--show-current")
    if branch != BRANCH:
        raise SystemExit(f"On branch {branch!r}, releases come from {BRANCH!r}")
    if git("status", "--porcelain"):
        raise SystemExit("Uncommitted changes – commit or stash them first:\n" + git("status", "--short"))

    git("fetch", "--quiet", REMOTE, BRANCH)
    behind = int(git("rev-list", "--count", f"HEAD..{REMOTE}/{BRANCH}"))
    if behind:
        raise SystemExit(f"{BRANCH} is {behind} commit(s) behind {REMOTE}/{BRANCH} – pull first")

    if git("tag", "--list", tag):
        raise SystemExit(f"Tag {tag} exists already")
    if git("ls-remote", "--tags", REMOTE, f"refs/tags/{tag}"):
        raise SystemExit(f"Tag {tag} exists on {REMOTE} already")


def main() -> None:
    parser = argparse.ArgumentParser(description="Tag and push the current PiSton version, build dist/.")
    parser.add_argument("--dry-run", action="store_true", help="only check and build, no tag, no push")
    parser.add_argument("--yes", action="store_true", help="do not ask before tagging and pushing")
    args = parser.parse_args()

    version = read_version()
    tag = f"v{version}"
    check(version, tag)

    build(ROOT / "dist")

    ahead = int(git("rev-list", "--count", f"{REMOTE}/{BRANCH}..HEAD"))
    print(f"\nRelease {tag} on {git('log', '-1', '--format=%h %s')}")
    print(f"Push: {ahead} commit(s) on {BRANCH} + tag {tag} → {REMOTE}")
    if args.dry_run:
        print("Dry run – nothing tagged or pushed.")
        return
    if not args.yes and input("Tag and push? [y/N] ").strip().lower() not in ("y", "yes"):
        print("Cancelled – nothing tagged or pushed. dist/ is built.")
        return

    git("tag", "--annotate", tag, "--message", f"PiSton {version}")
    push = subprocess.run(["git", "push", "--atomic", REMOTE, BRANCH, tag], cwd=ROOT)
    if push.returncode != 0:
        git("tag", "--delete", tag)
        raise SystemExit(f"Push failed – tag {tag} removed again, nothing changed on {REMOTE}")
    print(f"Done: {tag} pushed, demo in dist/.")


if __name__ == "__main__":
    sys.exit(main())
