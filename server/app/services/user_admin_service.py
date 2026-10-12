from datetime import datetime
from fastapi import HTTPException

from app.db.models.user import User
from app.schemas.user import RestrictUserRequest, UserOut
from beanie import PydanticObjectId


class UserAdminService:
    @staticmethod
    def _serialize(user: User) -> UserOut:
        return UserOut.model_validate({**user.model_dump(), "id": str(user.id)})

    @staticmethod
    async def restrict_user(
        user_id: str,
        data: RestrictUserRequest,
        admin: User,
    ) -> UserOut:
        try:
            oid = PydanticObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user id")

        if str(admin.id) == user_id:
            raise HTTPException(status_code=400, detail="You cannot restrict your own account")

        user = await User.get(oid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.role == "admin":
            raise HTTPException(status_code=403, detail="Cannot restrict admin accounts")
        if user.role not in ("patient", "doctor"):
            raise HTTPException(status_code=400, detail="Only patient or doctor accounts can be restricted")

        if user.isRestricted:
            return UserAdminService._serialize(user)

        user.isRestricted = True
        user.restrictedAt = datetime.utcnow()
        reason = (data.reason or "").strip() or None
        user.restrictionReason = reason
        await user.save()
        return UserAdminService._serialize(user)

    @staticmethod
    async def unrestrict_user(user_id: str, admin: User) -> UserOut:
        try:
            oid = PydanticObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user id")

        user = await User.get(oid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.isRestricted = False
        user.restrictedAt = None
        user.restrictionReason = None
        await user.save()
        return UserAdminService._serialize(user)
