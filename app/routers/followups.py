from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.schemas.followup import FollowupCreate, FollowupUpdate, FollowupResponse

from app.services.followup_service import create_followup,get_followups
from app.services.followup_service import update_followup,delete_followup
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User
from fastapi import HTTPException

router = APIRouter()


@router.post(
    "/applications/{application_id}/followups",
    response_model=FollowupResponse,
    status_code=200,
)
def create_followup_route(
    application_id: int,
    data: FollowupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.application_id != application_id:

        raise HTTPException(
            status_code=400,
            detail="Application ID does not match request URL",
        )

    return create_followup(db, data, current_user)


@router.get(
    "/applications/{application_id}/followups",
    response_model=list[FollowupResponse],
)
def get_followups_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_followups(db, application_id, current_user)


@router.put("/followups/{followup_id}", response_model=FollowupResponse)
def update_followup_route(
    followup_id: int,
    data: FollowupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_followup(db, followup_id, data, current_user)


@router.delete("/followups/{followup_id}")
def delete_followup_route(
    followup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_followup(db, followup_id, current_user)