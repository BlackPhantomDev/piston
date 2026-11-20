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
"""Tests for server/app.py."""

from aiohttp import web
from aiohttp.test_utils import AioHTTPTestCase

from server.app import create_app


class AppTest(AioHTTPTestCase):
    """Send requests to the app through a test client, without a port."""

    async def get_application(self) -> web.Application:
        """Return the app under test; called before every test."""
        return create_app()

    async def test_index(self) -> None:
        """/ returns index.html as HTML."""
        response = await self.client.get("/")
        self.assertEqual(response.status, 200)
        self.assertEqual(response.content_type, "text/html")

    async def test_static_file(self) -> None:
        """A .js file from public/ is served with a JavaScript type."""
        content_type_list = ["text/javascript", "application/javascript"]
        response = await self.client.get("/js/main.js")
        self.assertIn(response.content_type, content_type_list)

    async def test_not_found(self) -> None:
        """An unknown path returns 404."""
        response = await self.client.get("/invalid/path")
        self.assertEqual(response.status, 404)

    async def test_path_traversal(self) -> None:
        """Paths with .. cannot reach files outside public/."""
        test_paths = [
            "/../pyproject.toml",
            "/%2e%2e/pyproject.toml",
        ]
        for path in test_paths:
            with self.subTest(path=path):
                response = await self.client.get(path)
                self.assertNotEqual(response.status, 200)

    async def test_no_directory_listing(self) -> None:
        """A folder returns 403 instead of a list of its files."""
        response = await self.client.get("/js/")
        self.assertEqual(response.status, 403)

    async def test_cache_headers(self) -> None:
        """Files in /assets/ are cached for a week, all others no-cache."""
        test_headers = [
            ("/", "no-cache"),
            ("/js/main.js", "no-cache"),
            ("/assets/logo/favicon.svg", "max-age=604800"),
        ]
        for path, expected in test_headers:
            with self.subTest(path=path):
                response = await self.client.get(path)
                self.assertEqual(response.headers["Cache-Control"], expected)
