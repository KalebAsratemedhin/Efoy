import re
from app.db.models.doctor import Doctor
from app.db.models.user import User
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorOut
from beanie import PydanticObjectId
from fastapi import HTTPException
from typing import Dict, List, Optional
from app.core.security import pwd_context
from app.core.account_status import (
    get_restricted_doctor_user_ids,
    filter_out_ids,
    is_user_restricted,
    assert_doctor_publicly_visible,
)

DOCTOR_SORT_OPTIONS = {
    "rating_desc": [("rating", -1)],
    "price_asc": [("sessionPrice", 1)],
    "price_desc": [("sessionPrice", -1)],
    "experience_desc": [("experienceYears", -1)],
}


def _empty_doctor_page(page: int, limit: int) -> dict:
    return {
        "items": [],
        "total": 0,
        "page": page,
        "limit": limit,
        "total_pages": 0,
        "has_next": False,
        "has_prev": False,
    }


def _experience_years_expr() -> dict:
    """Parse leading integer from free-text experience (e.g. '6 years' → 6)."""
    return {
        "$convert": {
            "input": {"$arrayElemAt": [{"$split": ["$experience", " "]}, 0]},
            "to": "int",
            "onError": None,
            "onNull": None,
        }
    }


class DoctorService:
    @staticmethod
    async def find_all_doctors(
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        speciality: Optional[str] = None,
        min_rating: Optional[float] = None,
        min_experience: Optional[int] = None,
        max_experience: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort: str = "rating_desc",
        include_restricted: bool = False,
    ) -> dict:
        if sort not in DOCTOR_SORT_OPTIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid sort. Allowed: {', '.join(DOCTOR_SORT_OPTIONS)}",
            )

        match: dict = {}
        restricted_ids = set() if include_restricted else await get_restricted_doctor_user_ids()

        if speciality:
            match["speciality"] = {
                "$regex": f"^{re.escape(speciality.strip())}$",
                "$options": "i",
            }

        if min_rating is not None:
            match["rating"] = {"$gte": min_rating}

        price_filter: dict = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        if price_filter:
            match["sessionPrice"] = price_filter

        if search and search.strip():
            term = search.strip()
            users_by_name = await User.find({
                "role": "doctor",
                "fullName": {"$regex": re.escape(term), "$options": "i"},
            }).to_list()
            user_ids_by_name = {user.id for user in users_by_name if not is_user_restricted(user) or include_restricted}

            doctors_by_speciality = await Doctor.find({
                "speciality": {"$regex": re.escape(term), "$options": "i"},
            }).to_list()
            user_ids_by_speciality = set()
            for doc in doctors_by_speciality:
                link = doc.userId
                uid = link.ref.id if hasattr(link, "ref") else link.id
                user_ids_by_speciality.add(uid)

            user_ids = list(user_ids_by_name | user_ids_by_speciality)
            if not include_restricted:
                user_ids = filter_out_ids(user_ids, restricted_ids)
            if not user_ids:
                return _empty_doctor_page(page, limit)
            match["userId.id"] = {"$in": user_ids}
        elif restricted_ids:
            match["userId.id"] = {"$nin": list(restricted_ids)}

        needs_experience = (
            min_experience is not None
            or max_experience is not None
            or sort == "experience_desc"
        )

        pipeline: List[dict] = []
        if match:
            pipeline.append({"$match": match})

        if needs_experience:
            pipeline.append({"$addFields": {"experienceYears": _experience_years_expr()}})
            experience_match: dict = {}
            if min_experience is not None:
                experience_match["$gte"] = min_experience
            if max_experience is not None:
                experience_match["$lte"] = max_experience
            if experience_match:
                pipeline.append({
                    "$match": {
                        "experienceYears": experience_match,
                    }
                })

        skip = (page - 1) * limit
        sort_spec = DOCTOR_SORT_OPTIONS[sort]

        facet_pipeline = pipeline + [
            {
                "$facet": {
                    "meta": [{"$count": "total"}],
                    "items": [
                        {"$sort": dict(sort_spec)},
                        {"$skip": skip},
                        {"$limit": limit},
                    ],
                }
            }
        ]

        collection = Doctor.get_motor_collection()
        result = await collection.aggregate(facet_pipeline).to_list(length=1)
        facet = result[0] if result else {"meta": [], "items": []}
        total = facet["meta"][0]["total"] if facet["meta"] else 0
        raw_items = facet["items"]

        doctors_out: List[DoctorOut] = []
        for raw in raw_items:
            doctor = await Doctor.get(raw["_id"], fetch_links=True)
            if not doctor:
                continue
            linked_user = doctor.userId
            if (
                not include_restricted
                and isinstance(linked_user, User)
                and is_user_restricted(linked_user)
            ):
                continue
            doctors_out.append(DoctorOut.model_validate(doctor.model_dump()))

        total_pages = (total + limit - 1) // limit if total else 0
        return {
            "items": doctors_out,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    @staticmethod
    async def list_specialities(*, include_restricted: bool = False) -> List[str]:
        if include_restricted:
            specialities = await Doctor.distinct("speciality")
            return sorted(s for s in specialities if s)

        restricted_ids = await get_restricted_doctor_user_ids()
        doctors = await Doctor.find().to_list()
        specialities = set()
        for doc in doctors:
            link = doc.userId
            uid = link.ref.id if hasattr(link, "ref") else getattr(link, "id", None)
            if uid in restricted_ids:
                continue
            if doc.speciality:
                specialities.add(doc.speciality)
        return sorted(specialities)

    @staticmethod
    async def find_one_doctor(id: str, *, include_restricted: bool = False) -> dict:
        await assert_doctor_publicly_visible(id, allow_restricted=include_restricted)

        doctor = await Doctor.find_one(Doctor.userId.id == PydanticObjectId(id), fetch_links=True)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found.")
        return DoctorOut.model_validate(doctor.model_dump())

    @staticmethod
    async def find_doctor_by_user_id(user_id: str) -> dict:
        """Find doctor profile by user ID (for profile editing)"""
        doctor = await Doctor.find_one(Doctor.userId.id == PydanticObjectId(user_id), fetch_links=True)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found.")
        return DoctorOut.model_validate(doctor.model_dump())

    @staticmethod
    async def update_doctor(id: str, update: DoctorUpdate, current_user: User) -> dict:
        doc = await Doctor.find_one(Doctor.id == PydanticObjectId(id), fetch_links=True)
        if not doc:
            raise HTTPException(status_code=404, detail="Doctor profile not found.")

        if str(doc.userId.id) != str(current_user.id):
            raise HTTPException(status_code=401, detail="Unauthorized. You can only update your own profile.")

        update_data = update.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(doc, field, value)

        await doc.save()
        return DoctorOut.model_validate(doc.model_dump())

    @staticmethod
    async def update_working_hours(id: str, working_hours: Dict[str, Dict[str, str]], current_user: User) -> dict:
        doctor = await Doctor.find_one(Doctor.id == PydanticObjectId(id), fetch_links=True)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found.")

        if str(doctor.userId.id) != str(current_user.id):
            raise HTTPException(status_code=401, detail="Unauthorized. You can only update your own profile.")

        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for day, hours in working_hours.items():
            if day not in days:
                raise HTTPException(status_code=400, detail=f"Invalid day: {day}")
            if "start" not in hours or "end" not in hours:
                raise HTTPException(status_code=400, detail=f"Missing start or end time for {day}")
            if not re.match(r'^([01]\d|2[0-3]):([0-5]\d)$', hours["start"]):
                raise HTTPException(status_code=400, detail=f"Invalid start time format for {day}. Use HH:MM.")
            if not re.match(r'^([01]\d|2[0-3]):([0-5]\d)$', hours["end"]):
                raise HTTPException(status_code=400, detail=f"Invalid end time format for {day}. Use HH:MM.")
            if hours["start"] >= hours["end"]:
                raise HTTPException(status_code=400, detail=f"Start time must be before end time for {day}")

        current_working_hours = doctor.workingHours.copy()
        current_working_hours.update(working_hours)
        doctor.workingHours = current_working_hours

        await doctor.save()
        return DoctorOut.model_validate(doctor)

    @staticmethod
    async def admin_create_doctor(data):
        existing = await User.find_one({"email": data.email})
        if existing:
            raise HTTPException(status_code=409, detail="A user with this email already exists.")
        user = User(
            fullName=data.fullName,
            email=data.email,
            password=pwd_context.hash(data.password),
            phoneNumber=data.phoneNumber,
            role="doctor",
            isVerified=True
        )
        await user.insert()
        doctor = Doctor(
            userId=user,
            orgID=data.orgID,
            speciality=data.speciality,
            experience=data.experience,
            educationLevel=data.educationLevel,
            sessionPrice=data.sessionPrice
        )
        await doctor.insert()
        return DoctorOut.model_validate(doctor.model_dump())
