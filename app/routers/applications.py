from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.schemas.application import ApplicationStatusUpdate
from app.services.application_service import create_application, get_applications, update_application_status
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.application_service import get_application_by_id, update_application, delete_application
from app.services.application_service import get_applications_by_status, search_applications
from app.services.application_service import filter_sort_applications


router = APIRouter()


@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application_route(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_application(db, data, current_user)


@router.get("/applications", response_model=list[ApplicationResponse])
def get_applications_route(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_applications(
        db,
        current_user,
        page,
        limit,
    )

@router.get(
    "/applications/{application_id}",
    response_model=ApplicationResponse
)
def get_application_by_id_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_application_by_id(
        db,
        application_id,
        current_user
    )


@router.put(
    "/applications/{application_id}",
    response_model=ApplicationResponse
)
def update_application_route(
    application_id: int,
    data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_application(
        db,
        application_id,
        data,
        current_user
    )


@router.delete("/applications/{application_id}")
def delete_application_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_application(
        db,
        application_id,
        current_user
    )

@router.patch(
    "/applications/{application_id}/status",
    response_model=ApplicationResponse,
)
def update_application_status_route(
    application_id: int,
    data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_application_status(
        db,
        application_id,
        data,
        current_user,
    )


@router.get("/applications/status/{status}", response_model=list[ApplicationResponse])
def get_applications_by_status_route(
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_applications_by_status(db, status, current_user)

@router.get("/applications/search/{company_name}", response_model=list[ApplicationResponse])
def search_applications_route(
    company_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return search_applications(db, company_name, current_user)


@router.get("/applications/filter-sort",response_model=list[ApplicationResponse])
def filter_sort_applications_route(
    employment_type: str | None = None,
    sort_by: str = "applied_date",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return filter_sort_applications(
        db,
        current_user,
        employment_type,
        sort_by,
        order,
    )

