from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.services.note_service import (
    create_note,
    get_notes,
    update_note,
    delete_note,
)
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User
from fastapi import HTTPException

router = APIRouter()


@router.post(
    "/applications/{application_id}/notes",
    response_model=NoteResponse,
    status_code=200,
)
def create_note_route(
    application_id: int,
    data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.application_id != application_id:
        raise HTTPException(
            status_code=400,
            detail="Application ID does not match"
        )

    return create_note(db, data, current_user)


@router.get("/applications/{application_id}/notes",response_model=list[NoteResponse])
def get_notes_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_notes(db, application_id, current_user)


@router.put("/notes/{note_id}",response_model=NoteResponse)
def update_note_route(
    note_id: int,
    data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_note(db, note_id, data, current_user)


@router.delete("/notes/{note_id}")
def delete_note_route(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_note(db, note_id, current_user)