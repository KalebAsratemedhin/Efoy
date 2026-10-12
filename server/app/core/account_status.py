from typing import Iterable, List, Optional, Set
from fastapi import HTTPException
from beanie import PydanticObjectId

from app.db.models.user import User


def is_user_restricted(user: Optional[User]) -> bool:
    return bool(user and getattr(user, "isRestricted", False))


async def get_restricted_doctor_user_ids() -> Set[PydanticObjectId]:
    users = await User.find({"role": "doctor", "isRestricted": True}).to_list()
    return {u.id for u in users}


def filter_out_ids(
    ids: Iterable[PydanticObjectId],
    excluded: Set[PydanticObjectId],
) -> List[PydanticObjectId]:
    return [i for i in ids if i not in excluded]


async def assert_doctor_bookable(doctor_user_id: str) -> User:
    """Ensure the doctor user exists and is not restricted (for booking/slots)."""
    try:
        oid = PydanticObjectId(doctor_user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid doctor id")
    user = await User.get(oid)
    if not user or user.role != "doctor":
        raise HTTPException(status_code=404, detail="Doctor not found")
    if is_user_restricted(user):
        raise HTTPException(
            status_code=403,
            detail="This doctor is not available for booking",
        )
    return user


async def assert_doctor_publicly_visible(
    doctor_user_id: str,
    *,
    allow_restricted: bool = False,
) -> User:
    """Public doctor profile fetch: restricted doctors look like 404 unless admin."""
    try:
        oid = PydanticObjectId(doctor_user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid doctor id")
    user = await User.get(oid)
    if not user or user.role != "doctor":
        raise HTTPException(status_code=404, detail="Doctor not found")
    if is_user_restricted(user) and not allow_restricted:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return user
