from datetime import datetime

from pydantic import BaseModel


class FollowupCreate(BaseModel):
    application_id: int
    followup_date: datetime
    note: str | None = None


class FollowupUpdate(BaseModel):
    followup_date: datetime | None = None
    note: str | None = None


class FollowupResponse(BaseModel):
    id: int
    application_id: int
    followup_date: datetime
    note: str | None = None
    created_at: datetime | None = None