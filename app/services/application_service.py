from sqlalchemy.orm import Session
from app.models.application import Application
from app.schemas.application import ApplicationCreate
from app.models.user import User
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from app.schemas.application import ApplicationUpdate
from app.schemas.application import ApplicationStatusUpdate


def create_application(
    db: Session,
    data: ApplicationCreate,
    current_user: User,
):
    application = Application(
        **data.model_dump(),
        user_id=current_user.id
    )

    try:
        db.add(application)
        db.commit()
        db.refresh(application)
        return application

    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Application creation failed"
        ) from exc



def get_application_by_id(
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

    return application


def update_application(
    db: Session,
    application_id: int,
    data: ApplicationUpdate,
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

    application_data = data.model_dump(exclude_unset=True)

    for key, value in application_data.items():
        setattr(application, key, value)

    db.commit()
    db.refresh(application)

    return application



def delete_application(
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

    db.delete(application)
    db.commit()

    return {"message": "Application deleted successfully"}


def update_application_status(
    db: Session,
    application_id: int,
    data: ApplicationStatusUpdate,
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

    application.status = data.status

    db.commit()
    db.refresh(application)

    return application


def get_applications_by_status(
    db: Session,
    status: str,
    current_user: User,
):
    allowed_statuses = [
        "SAVED", "APPLIED", "SCREENING", "INTERVIEW",
        "OFFER", "ACCEPTED", "REJECTED", "WITHDRAWN"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status"
        )

    applications = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.status == status
    ).all()

    return applications


def search_applications(
    db: Session,
    company_name: str,
    current_user: User,
):
    if not company_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Company name cannot be empty"
        )

    applications = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.company_name.ilike(company_name.strip())
    ).all()

    if not applications:
        raise HTTPException(
            status_code=404,
            detail="No applications found for this company"
        )

    return applications


def get_applications(
    db: Session,
    current_user: User,
    page: int = 1,
    limit: int = 10,
):
    offset = (page - 1) * limit

    applications = db.query(Application).filter(
        Application.user_id == current_user.id
    ).offset(offset).limit(limit).all()

    return applications

def filter_sort_applications(
    db: Session,
    current_user: User,
    employment_type: str | None = None,
    sort_by: str = "applied_date",
    order: str = "desc",
):
    query = db.query(Application).filter(
        Application.user_id == current_user.id
    )

    if employment_type:
        query = query.filter(
            Application.employment_type.ilike(employment_type.strip())
        )

    allowed_fields = ["applied_date", "company_name", "salary_min"]

    if sort_by not in allowed_fields:
        raise HTTPException(
            status_code=400,
            detail="Invalid sorting field"
        )

    if order not in ["asc", "desc"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid sorting order"
        )

    column = getattr(Application, sort_by)

    if order == "asc":
        query = query.order_by(column.asc())
    else:
        query = query.order_by(column.desc())

    return query.all()