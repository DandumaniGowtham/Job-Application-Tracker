from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.interview import Interview
from app.models.application import Application
from app.models.user import User
from app.schemas.interview import InterviewCreate, InterviewUpdate


def create_interview(
    db: Session,
    data: InterviewCreate,
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

    interview = Interview(**data.model_dump())

    db.add(interview)
    db.commit()
    db.refresh(interview)

    return interview


def get_interviews(
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

    return db.query(Interview).filter(
        Interview.application_id == application_id
    ).all()


def update_interview(
    db: Session,
    interview_id: int,
    data: InterviewUpdate,
    current_user: User,
):
    interview = db.query(Interview).join(Application).filter(
        Interview.id == interview_id,
        Application.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(interview, key, value)

    db.commit()
    db.refresh(interview)

    return interview


def delete_interview(
    db: Session,
    interview_id: int,
    current_user: User,
):
    interview = db.query(Interview).join(Application).filter(
        Interview.id == interview_id,
        Application.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    db.delete(interview)
    db.commit()

    return {"message": "Interview deleted successfully"}