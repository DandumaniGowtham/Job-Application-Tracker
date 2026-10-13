from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.followup import Followup
from app.models.application import Application
from app.models.user import User
from app.schemas.followup import (
    FollowupCreate,
    FollowupUpdate,
    FollowupResponse,
)


def create_followup(
    db: Session,
    data: FollowupCreate,
    current_user: User,
):
    application = db.query(Application).filter(
        Application.id == data.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    followup = Followup(**data.model_dump())

    db.add(followup)
    db.commit()
    db.refresh(followup)

    return FollowupResponse(
        id=followup.id,
        application_id=followup.application_id,
        followup_date=followup.followup_date,
        note=followup.note,
        created_at=followup.created_at,
    )


def get_followups(
    db: Session,
    application_id: int,
    current_user: User,
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    followups = db.query(Followup).filter(
        Followup.application_id == application_id
    ).all()

    followup_responses = []

    for followup in followups:
        followup_response = FollowupResponse(
            id=followup.id,
            application_id=followup.application_id,
            followup_date=followup.followup_date,
            note=followup.note,
            created_at=followup.created_at,
        )

        followup_responses.append(followup_response)

    return followup_responses


def update_followup(
    db: Session,
    followup_id: int,
    data: FollowupUpdate,
    current_user: User,
):
    followup = db.query(Followup).join(Application).filter(
        Followup.id == followup_id,
        Application.user_id == current_user.id
    ).first()

    if not followup:
        raise HTTPException(
            status_code=404,
            detail="Follow-up not found"
        )

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(followup, key, value)

    db.commit()
    db.refresh(followup)

    return FollowupResponse(
        id=followup.id,
        application_id=followup.application_id,
        followup_date=followup.followup_date,
        note=followup.note,
        created_at=followup.created_at,
    )


def delete_followup(
    db: Session,
    followup_id: int,
    current_user: User,
):
    followup = db.query(Followup).join(Application).filter(
        Followup.id == followup_id,
        Application.user_id == current_user.id
    ).first()

    if not followup:
        raise HTTPException(
            status_code=404,
            detail="Follow-up not found"
        )

    db.delete(followup)
    db.commit()

    return {"message": "Follow-up deleted successfully"}