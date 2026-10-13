from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.dashboard_service import get_dashboard_stats
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User


router = APIRouter()


@router.get("/dashboard")
def get_dashboard_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_stats(db, current_user)