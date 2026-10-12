from app.db.models.rating import Rating
from app.db.models.user import User
from app.db.models.doctor import Doctor
from app.schemas.rating import RatingCreate, RatingUpdate
from beanie import PydanticObjectId
from fastapi import HTTPException
from typing import List, Optional
from beanie.operators import And
from app.core.account_status import is_user_restricted

class RatingService:
    @staticmethod
    async def create_rating(data: RatingCreate, current_user: User):
        if str(current_user.id) == data.doctorId:
            raise HTTPException(status_code=400, detail="You cannot rate yourself.")
        
        # Get the doctor user object
        doctor_user = await User.get(PydanticObjectId(data.doctorId))
        if not doctor_user:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        # Check for existing rating by this user for this doctor
        existing_rating = await Rating.find_one(
            And(
                Rating.doctorId.id == PydanticObjectId(data.doctorId),
                Rating.raterId.id == current_user.id
            ),
            fetch_links=False
        )

        from app.services.notification_service import NotificationService

        if existing_rating:
            # Update existing rating instead of creating duplicate
            existing_rating.value = data.value
            await existing_rating.save()
            await RatingService.update_total_rating(data.doctorId)
            await NotificationService.notify(
                recipient_id=data.doctorId,
                type="rating_created",
                title="Rating updated",
                message=f"{current_user.fullName} updated their rating to {data.value}/5.",
                actor_id=current_user.id,
                data={"doctorId": data.doctorId, "value": data.value},
            )
            return existing_rating.model_dump()
        
        # Create new rating
        rating = Rating(
            doctorId=doctor_user,
            raterId=current_user,
            value=data.value
        )
        await rating.insert()
        await RatingService.update_total_rating(data.doctorId)
        await NotificationService.notify(
            recipient_id=data.doctorId,
            type="rating_created",
            title="New rating",
            message=f"{current_user.fullName} rated you {data.value}/5.",
            actor_id=current_user.id,
            data={"doctorId": data.doctorId, "value": data.value, "ratingId": str(rating.id)},
        )
        return rating.model_dump()

    @staticmethod
    async def delete_rating(id: str, current_user: User):
        rating = await Rating.get(PydanticObjectId(id), fetch_links=False)
        if not rating:
            raise HTTPException(status_code=404, detail="Not found")
        
        # Check if the rating belongs to the current user
        if str(rating.raterId.ref.id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="You can only delete your own ratings")
        
        doctorId = str(rating.doctorId.ref.id)
        await rating.delete()
        await RatingService.update_total_rating(doctorId)
        return {"message": "Rating deleted successfully"}

    @staticmethod
    async def update_rating(id: str, data: RatingUpdate, current_user: User):
        rating = await Rating.get(PydanticObjectId(id), fetch_links=False)
        if not rating:
            raise HTTPException(status_code=404, detail="Not found")
        
        # Check if the rating belongs to the current user
        if str(rating.raterId.ref.id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="You can only update your own ratings")
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(rating, field, value)
        await rating.save()
        
        doctorId = str(rating.doctorId.ref.id)
        await RatingService.update_total_rating(doctorId)
        return rating.model_dump()

    @staticmethod
    async def get_rating(doctorId: str, current_user: User):
        rating = await Rating.find_one(
            And(
                Rating.doctorId.id == PydanticObjectId(doctorId),
                Rating.raterId.id == current_user.id
            ),
            fetch_links=True
        )
        if rating:
            # Convert to dict and ensure proper ID formatting
            rating_dict = rating.model_dump()
            rating_dict['id'] = str(rating.id)
            rating_dict['raterId'] = str(rating.raterId.id)
            rating_dict['doctorId'] = str(rating.doctorId.id)
            return rating_dict
        return None

    @staticmethod
    def _serialize_rating(rating: Rating) -> dict:
        def _id(link) -> str:
            if hasattr(link, "ref"):
                return str(link.ref.id)
            if hasattr(link, "id"):
                return str(link.id)
            return str(link)

        return {
            "id": str(rating.id),
            "raterId": _id(rating.raterId),
            "doctorId": _id(rating.doctorId),
            "value": rating.value,
            "created_at": rating.created_at,
            "updated_at": rating.updated_at,
        }

    @staticmethod
    async def get_doctor_ratings(doctorId: str, page: int = 1, limit: int = 10):
        """Get paginated ratings for a specific doctor"""
        try:
            doctor_oid = PydanticObjectId(doctorId)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid doctorId")

        find_filter = Rating.doctorId.id == doctor_oid
        skip = (page - 1) * limit
        total = await Rating.find(find_filter).count()
        ratings = (
            await Rating.find(find_filter, fetch_links=False)
            .sort([("created_at", -1)])
            .skip(skip)
            .limit(limit)
            .to_list()
        )
        total_pages = (total + limit - 1) // limit if total else 0
        return {
            "items": [RatingService._serialize_rating(r) for r in ratings],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    @staticmethod
    async def get_favorites(current_user: User):
        favorites = await Rating.find(
            Rating.raterId.id == current_user.id,
            fetch_links=False
        ).to_list()
        doctor_ids = list({str(r.doctorId.ref.id) for r in favorites})
        result = []
        for doc_id in doctor_ids:
            user = await User.get(PydanticObjectId(doc_id))
            if not user or is_user_restricted(user):
                continue
            doc = await Doctor.find_one(Doctor.userId.id == PydanticObjectId(doc_id))
            if user and doc:
                # Return in the format expected by DoctorCard component
                doctor_data = {
                    "id": str(doc.id),
                    "userId": {
                        "id": str(user.id),
                        "fullName": user.fullName,
                        "email": user.email,
                        "profilePic": user.profilePic,
                        "phoneNumber": user.phoneNumber,
                        "role": user.role
                    },
                    "speciality": doc.speciality,
                    "experience": doc.experience,
                    "educationLevel": doc.educationLevel,
                    "rating": doc.rating,
                    "orgID": doc.orgID,
                    "workingHours": doc.workingHours,
                    "created_at": doc.created_at,
                    "updated_at": doc.updated_at
                }
                result.append(doctor_data)
        return result

    @staticmethod
    async def update_total_rating(doctorId: str):
        # Get all ratings for this doctor
        ratings = await Rating.find(
            Rating.doctorId.id == PydanticObjectId(doctorId),
            fetch_links=False
        ).to_list()
        
        if not ratings:
            # No ratings, set to 0
            doctor = await Doctor.find_one(Doctor.userId.id == PydanticObjectId(doctorId))
            if doctor:
                doctor.rating = 0.0
                await doctor.save()
            return
        
        # Calculate average rating
        total = sum(r.value for r in ratings)
        avg = total / len(ratings)
        
        # Update doctor's rating
        doctor = await Doctor.find_one(Doctor.userId.id == PydanticObjectId(doctorId))
        if doctor:
            doctor.rating = round(avg, 2)  # Round to 2 decimal places
            await doctor.save()
        
        return doctor.model_dump() if doctor else None 