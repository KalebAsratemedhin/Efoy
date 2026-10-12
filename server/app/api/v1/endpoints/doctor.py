from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, Dict, List
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorOut, DoctorPaginatedResponse
from app.services.doctor_service import DoctorService
from app.core.security import get_current_user, get_optional_current_user, admin_required
from app.db.models.user import User
from datetime import date
from app.services.booking_service import BookingService
from app.core.account_status import assert_doctor_bookable

router = APIRouter()


@router.get('/', response_model=DoctorPaginatedResponse)
async def find_all_doctors(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    speciality: Optional[str] = None,
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    min_experience: Optional[int] = Query(None, ge=0),
    max_experience: Optional[int] = Query(None, ge=0),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort: str = Query("rating_desc"),
    include_restricted: bool = Query(False),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    allow_restricted = bool(
        include_restricted and current_user and current_user.role == "admin"
    )
    return await DoctorService.find_all_doctors(
        page=page,
        limit=limit,
        search=search,
        speciality=speciality,
        min_rating=min_rating,
        min_experience=min_experience,
        max_experience=max_experience,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        include_restricted=allow_restricted,
    )


@router.get('/specialities', response_model=List[str])
async def list_specialities(
    include_restricted: bool = Query(False),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Distinct specialities for filter dropdowns."""
    allow_restricted = bool(
        include_restricted and current_user and current_user.role == "admin"
    )
    return await DoctorService.list_specialities(include_restricted=allow_restricted)


@router.get('/available-slots', response_model=List[str])
async def available_slots(
    doctor: str = Query(...),
    date: date = Query(...),
    current_user: User = Depends(get_current_user)
):
    await assert_doctor_bookable(doctor)
    return await BookingService.find_available_time_slots(doctor, date)


@router.get('/{id}', response_model=DoctorOut)
async def find_one_doctor(
    id: str,
    include_restricted: bool = Query(False),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    allow_restricted = bool(
        include_restricted and current_user and current_user.role == "admin"
    )
    return await DoctorService.find_one_doctor(id, include_restricted=allow_restricted)


@router.get('/user/{user_id}', response_model=DoctorOut)
async def find_doctor_by_user_id(user_id: str, current_user: User = Depends(get_current_user)):
    """Get doctor profile by user ID (for profile editing)"""
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=403, detail="Can only access your own profile")
    return await DoctorService.find_doctor_by_user_id(user_id)


@router.put('/{id}', response_model=DoctorOut)
async def update_doctor(id: str, update: DoctorUpdate, current_user: User = Depends(get_current_user)):
    return await DoctorService.update_doctor(id, update, current_user)


@router.put('/{id}/working-hours', response_model=DoctorOut)
async def update_working_hours(id: str, working_hours: Dict[str, Dict[str, str]], current_user: User = Depends(get_current_user)):
    return await DoctorService.update_working_hours(id, working_hours, current_user)


@router.post('/admin-create', response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
async def admin_create_doctor(
    data: DoctorCreate,
    current_user: User = Depends(admin_required)
):
    """
    Admin creates a doctor. All fields in a flat DoctorCreate schema.
    """
    return await DoctorService.admin_create_doctor(data)
