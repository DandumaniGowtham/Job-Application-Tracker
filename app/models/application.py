
from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    Enum,
)
from sqlalchemy.sql import func

from app.database.connection import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    location = Column(String, nullable=False)
    employment_type = Column(String, nullable=False)
    source = Column(String, nullable=False)
    job_url = Column(String, nullable=True)

    salary_min = Column(Numeric(12, 2), nullable=True)
    salary_max = Column(Numeric(12, 2), nullable=True)

    applied_date = Column(Date, nullable=False)

    status = Column(
        Enum(
            "SAVED",
            "APPLIED",
            "SCREENING",
            "INTERVIEW",
            "OFFER",
            "ACCEPTED",
            "REJECTED",
            "WITHDRAWN",
            name="application_status",
        ),
        nullable=False,
        default="APPLIED",
        server_default="APPLIED",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
