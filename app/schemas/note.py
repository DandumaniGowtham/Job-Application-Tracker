from datetime import datetime

from pydantic import BaseModel


class NoteCreate(BaseModel):
    application_id: int
    content: str


class NoteUpdate(BaseModel):
    content: str


class NoteResponse(BaseModel):
    id: int
    application_id: int
    content: str
    created_at: datetime
    updated_at: datetime | None = None