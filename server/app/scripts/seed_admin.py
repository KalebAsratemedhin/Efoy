"""Manual admin seed using the same env-driven bootstrap as app startup.

Prefer setting ADMIN_EMAIL / ADMIN_PASSWORD and starting the API.
This script is for one-off seeding without running the full server.
"""
import asyncio
from app.db.session import initiate_database
from app.core.bootstrap import ensure_admin_user


async def seed_admin():
    await initiate_database()
    await ensure_admin_user()


if __name__ == "__main__":
    asyncio.run(seed_admin())
