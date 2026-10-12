from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from app.schemas.user import UserOut, UserUpdate, RestrictUserRequest
from app.schemas.common import PaginatedResponse
from app.db.models.user import User
from app.core.security import get_current_user, admin_required
from app.services.user_admin_service import UserAdminService
from beanie import PydanticObjectId
import cloudinary.uploader
from app.utils.file_validation import validate_image_file

router = APIRouter()

@router.get('/current-user', response_model=UserOut)
async def get_user(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate({**current_user.model_dump(), "id": str(current_user.id)})

@router.get('/admin-stats')
async def admin_stats(current_user: User = Depends(admin_required)):
    from app.db.models.doctor import Doctor
    from app.db.models.booking import Booking
    doctors_count = await Doctor.find_all().count()
    patients_count = await User.find(User.role == 'patient').count()
    appointments_count = await Booking.find_all().count()
    return {"doctorsCount": doctors_count, "patientsCount": patients_count, "appointmentsCount": appointments_count}

@router.get('/', response_model=PaginatedResponse[UserOut])
async def find_all_users(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    skip = (page - 1) * limit
    users = await User.find_all().skip(skip).limit(limit).to_list()
    total_users = await User.find_all().count()
    total_pages = (total_users + limit - 1) // limit
    
    return PaginatedResponse[UserOut](
        items=[UserOut.model_validate({**user.model_dump(), "id": str(user.id)}) for user in users],
        total=total_users,
        page=page,
        limit=limit,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1
    )

@router.post('/{id}/restrict', response_model=UserOut)
async def restrict_user(
    id: str,
    data: RestrictUserRequest = RestrictUserRequest(),
    current_user: User = Depends(admin_required),
):
    return await UserAdminService.restrict_user(id, data, current_user)

@router.post('/{id}/unrestrict', response_model=UserOut)
async def unrestrict_user(
    id: str,
    current_user: User = Depends(admin_required),
):
    return await UserAdminService.unrestrict_user(id, current_user)

@router.get('/{id}', response_model=UserOut)
async def find_one_user(id: str, current_user: User = Depends(get_current_user)):
    if str(current_user.id) != id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to view this user")
    
    user = await User.get(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut.model_validate({**user.model_dump(), "id": str(user.id)})

@router.put('/{id}', response_model=UserOut)
async def update_user(id: str, user_update: UserUpdate, current_user: User = Depends(get_current_user)):
    if str(current_user.id) != id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    user = await User.get(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await user.update({"$set": user_update.model_dump(exclude_unset=True)})
    await user.save()
    return UserOut.model_validate({**user.model_dump(), "id": str(user.id)})

@router.put('/profile-pic/{id}', response_model=UserOut)
async def update_profile_picture(id: str, file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # Validate file before processing
    validate_image_file(file)
    
    user = await User.get(PydanticObjectId(id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    try:
        result = cloudinary.uploader.upload(file.file)
        user.profilePic = result['secure_url']
        await user.save()
        return UserOut.model_validate({**user.model_dump(), "id": str(user.id)})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to upload image. Please try again.")

@router.delete('/{id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(id: str, current_user: User = Depends(admin_required)):
    user = await User.get(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete() 