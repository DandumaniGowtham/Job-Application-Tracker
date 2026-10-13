from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.sql import func

from app.database.connection import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True)

    application_id = Column(
        Integer,
        ForeignKey("applications.id"),
        nullable=False
    )

    interview_type = Column(String)
    scheduled_at = Column(Date)
    interviewer = Column(String)
    meeting_link = Column(String)
    status = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())