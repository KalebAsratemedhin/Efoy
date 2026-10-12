import logging

from app.core.config import get_settings
from app.core.security import pwd_context
from app.db.models.user import User

logger = logging.getLogger(__name__)


async def ensure_admin_user() -> None:
    """Create the admin account from env if it does not already exist.

    Idempotent: never updates an existing user (password/name stay as-is).
    Skips when ADMIN_EMAIL or ADMIN_PASSWORD is not configured.
    """
    settings = get_settings()
    email = (settings.ADMIN_EMAIL or "").strip().lower()
    password = settings.ADMIN_PASSWORD
    full_name = (settings.ADMIN_FULL_NAME or "Admin").strip() or "Admin"

    if not email or not password:
        logger.info("Admin bootstrap skipped (ADMIN_EMAIL / ADMIN_PASSWORD not set)")
        return

    existing = await User.find_one({"email": email})
    if existing:
        if existing.role != "admin":
            logger.warning(
                "User %s exists but role=%s; admin bootstrap will not overwrite",
                email,
                existing.role,
            )
        else:
            logger.info("Admin user already exists: %s", email)
        return

    admin = User(
        fullName=full_name,
        email=email,
        password=pwd_context.hash(password),
        role="admin",
        isVerified=True,
    )
    await admin.insert()
    logger.info("Admin user created: %s", email)
