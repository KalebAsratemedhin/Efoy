from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from app.core.security import get_current_user, get_optional_current_user
from app.db.models.user import User
from app.schemas.doctor_board import (
    DoctorPostCreate,
    DoctorPostUpdate,
    DoctorPostOut,
    DoctorPostPaginatedResponse,
)
from app.services.doctor_board_service import DoctorBoardService

router = APIRouter()


@router.post("/", response_model=DoctorPostOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    data: DoctorPostCreate,
    current_user: User = Depends(get_current_user),
):
    return await DoctorBoardService.create_post(data, current_user)


@router.get("/post/{post_id}", response_model=DoctorPostOut)
async def get_post(
    post_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    return await DoctorBoardService.get_post(post_id, current_user)


@router.get("/{doctor_user_id}", response_model=DoctorPostPaginatedResponse)
async def list_posts(
    doctor_user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    return await DoctorBoardService.list_posts(
        doctor_user_id=doctor_user_id,
        page=page,
        limit=limit,
        category=category,
        status=status,
        current_user=current_user,
    )


@router.put("/{post_id}", response_model=DoctorPostOut)
async def update_post(
    post_id: str,
    data: DoctorPostUpdate,
    current_user: User = Depends(get_current_user),
):
    return await DoctorBoardService.update_post(post_id, data, current_user)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
):
    await DoctorBoardService.delete_post(post_id, current_user)
    return None
