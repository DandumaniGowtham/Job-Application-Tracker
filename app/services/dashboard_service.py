from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.application import Application
from app.models.user import User

from datetime import date
from app.models.followup import Followup
from app.models.interview import Interview


def get_dashboard_stats(
    db: Session,
    current_user: User,
):

    
    total_applications = db.query(Application).filter(
        Application.user_id == current_user.id
    ).count()

    applications_by_status = db.query(
        Application.status,
        func.count(Application.id)
    ).filter(
        Application.user_id == current_user.id
    ).group_by(
        Application.status
    ).all()

    status_counts = {
        status.lower(): count
        for status, count in applications_by_status
    }
    followups_due = db.query(Followup).join(
    Application,
    Followup.application_id == Application.id,
    ).filter(
    Application.user_id == current_user.id,
    Followup.followup_date <= date.today(),
    ).count()

    total_interviews = db.query(Interview).join(
    Application,
    Interview.application_id == Application.id,
    ).filter(
    Application.user_id == current_user.id
    ).count()

    return {
        "total_applications": total_applications,
        "saved": status_counts.get("saved", 0),
        "applied": status_counts.get("applied", 0),
        "screening": status_counts.get("screening", 0),
        "interviews": total_interviews,
        "offers": status_counts.get("offer", 0),
        "accepted": status_counts.get("accepted", 0),
        "rejected": status_counts.get("rejected", 0),
        "withdrawn": status_counts.get("withdrawn", 0),
        "followups_due": followups_due,
    }