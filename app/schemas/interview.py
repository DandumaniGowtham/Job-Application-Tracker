from datetime import date, time, datetime

from pydantic import BaseModel, ConfigDict


class InterviewCreate(BaseModel):
    application_id: int
    interview_type: str
    scheduled_at: date
    interviewer: str | None = None
    meeting_link: str | None = None
    status: str = "SCHEDULED"


class InterviewUpdate(BaseModel):
    interview_type: str | None = None
    scheduled_at: date | None = None
    interviewer: str | None = None
    meeting_link: str | None = None
    status: str | None = None


class InterviewResponse(BaseModel):
    id: int
    application_id: int
    interview_type: str | None
    scheduled_at: date | None
    interviewer: str | None
    meeting_link: str | None
    status: str | None
    created_at: datetime | None

    model_config = ConfigDict(from_attributes=True)