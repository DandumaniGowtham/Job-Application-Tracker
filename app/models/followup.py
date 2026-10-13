from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class Followup(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True)

    application_id = Column(
        Integer,
        ForeignKey("applications.id"),
        nullable=False
    )

    followup_date = Column(DateTime, nullable=False)
    note = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())