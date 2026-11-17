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
"""The aiohttp app: routes, static files from public/ and cache headers."""

from pathlib import Path

from aiohttp import web

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

MAX_AGE = 604800
NO_CACHE = "no-cache"


def create_app() -> web.Application:
    """Build the app with its routes and middlewares.

    / returns index.html, every other path a file from public/.
    The app is only built here, not started.
    """
    app = web.Application(middlewares=[cache_headers])
    app.router.add_get("/", handle_index)
    app.router.add_static("/", PUBLIC, show_index=False, follow_symlinks=False)
    return app


async def handle_index(request: web.Request) -> web.FileResponse:
    """Return public/index.html."""
    return web.FileResponse(PUBLIC / "index.html")


@web.middleware
async def cache_headers(request: web.Request, handler) -> web.StreamResponse:
    """Set Cache-Control on every response.

    Files in /assets/ may be cached for a week. Everything else gets
    no-cache, so the browser checks the ETag and gets updates at once.
    """
    response = await handler(request)
    if request.path.startswith("/assets/"):
        response.headers["Cache-Control"] = f"max-age={MAX_AGE}"
    else:
        response.headers["Cache-Control"] = NO_CACHE
    return response
