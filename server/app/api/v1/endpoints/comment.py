from fastapi import APIRouter, Depends, Query, status
from app.schemas.comment import CommentCreate, CommentUpdate, CommentOut, CommentPaginatedResponse
from app.services.comment_service import CommentService
from app.core.security import get_current_user
from app.db.models.user import User

router = APIRouter()

@router.post('/', response_model=CommentOut, status_code=status.HTTP_201_CREATED)
async def create_comment(data: CommentCreate, current_user: User = Depends(get_current_user)):
    return await CommentService.create_comment(data, current_user)

@router.delete('/{id}', response_model=CommentOut)
async def delete_comment(id: str, current_user: User = Depends(get_current_user)):
    return await CommentService.delete_comment(id, current_user)

@router.put('/{id}', response_model=CommentOut)
async def update_comment(id: str, data: CommentUpdate, current_user: User = Depends(get_current_user)):
    return await CommentService.update_comment(id, data, current_user)

@router.get('/{doctorId}', response_model=CommentPaginatedResponse)
async def get_comments(
    doctorId: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    return await CommentService.get_comments(doctorId, page=page, limit=limit) 