from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from app.core.security import get_current_user, get_optional_current_user
from app.db.models.user import User
from app.schemas.doctor_qa import (
    DoctorQuestionCreate,
    DoctorAnswerCreate,
    DoctorAnswerUpdate,
    DoctorQuestionOut,
    DoctorQuestionPaginatedResponse,
)
from app.services.doctor_qa_service import DoctorQAService

router = APIRouter()


@router.post("/", response_model=DoctorQuestionOut, status_code=status.HTTP_201_CREATED)
async def create_question(
    data: DoctorQuestionCreate,
    current_user: User = Depends(get_current_user),
):
    return await DoctorQAService.create_question(data, current_user)


@router.get("/{doctor_user_id}", response_model=DoctorQuestionPaginatedResponse)
async def list_questions(
    doctor_user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    return await DoctorQAService.list_questions(
        doctor_user_id=doctor_user_id,
        page=page,
        limit=limit,
        status=status,
        current_user=current_user,
    )


@router.post("/{question_id}/answer", response_model=DoctorQuestionOut)
async def answer_question(
    question_id: str,
    data: DoctorAnswerCreate,
    current_user: User = Depends(get_current_user),
):
    return await DoctorQAService.answer_question(question_id, data, current_user)


@router.put("/{question_id}/answer", response_model=DoctorQuestionOut)
async def update_answer(
    question_id: str,
    data: DoctorAnswerUpdate,
    current_user: User = Depends(get_current_user),
):
    return await DoctorQAService.update_answer(question_id, data, current_user)


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: str,
    current_user: User = Depends(get_current_user),
):
    await DoctorQAService.delete_question(question_id, current_user)
    return None
