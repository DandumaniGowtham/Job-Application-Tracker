from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewResponse
from app.services.interview_service import (
    create_interview,
    get_interviews,
    update_interview,
    delete_interview,
)
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User
from fastapi import HTTPException

router = APIRouter()


@router.post(
    "/applications/{application_id}/interviews",
    response_model=InterviewResponse,
    status_code=200,
)
def create_interview_route(
    application_id: int,
    data: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.application_id != application_id:

        raise HTTPException(
            status_code=400,
            detail="Application ID does not match request URL",
        )

    return create_interview(db, data, current_user)


@router.get(
    "/applications/{application_id}/interviews",
    response_model=list[InterviewResponse],
)
def get_interviews_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_interviews(db, application_id, current_user)


@router.put("/interviews/{interview_id}", response_model=InterviewResponse)
def update_interview_route(
    interview_id: int,
    data: InterviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_interview(db, interview_id, data, current_user)


@router.delete("/interviews/{interview_id}")
def delete_interview_route(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_interview(db, interview_id, current_user)