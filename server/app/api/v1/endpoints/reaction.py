from fastapi import APIRouter, Depends, Query, status

from app.core.security import get_current_user
from app.db.models.user import User
from app.schemas.reaction import ReactionCreate, ReactionOut
from app.services.reaction_service import ReactionService

router = APIRouter()


@router.post("/", response_model=ReactionOut, status_code=status.HTTP_200_OK)
async def set_reaction(
    data: ReactionCreate,
    current_user: User = Depends(get_current_user),
):
    """Set or flip like/dislike on a post, question, or answer."""
    return await ReactionService.set_reaction(data, current_user)


@router.delete("/", response_model=ReactionOut)
async def remove_reaction(
    targetType: str = Query(..., description="post | question | answer"),
    targetId: str = Query(...),
    current_user: User = Depends(get_current_user),
):
    """Remove the current user's reaction from a target."""
    return await ReactionService.remove_reaction(targetType, targetId, current_user)
