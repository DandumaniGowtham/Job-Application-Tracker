from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.note import Note
from app.models.application import Application
from app.models.user import User
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse


def create_note(
    db: Session,
    data: NoteCreate,
    current_user: User,
):
    application = db.query(Application).filter(
        Application.id == data.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    note = Note(
        application_id=data.application_id,
        content=data.content
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    note_response = NoteResponse(
        id=note.id,
        application_id=note.application_id,
        content=note.content,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )

    return note_response


def get_notes(
    db: Session,
    application_id: int,
    current_user: User,
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    notes = db.query(Note).filter(
        Note.application_id == application_id
    ).all()

    note_responses = []

    for note in notes:
        note_response = NoteResponse(
            id=note.id,
            application_id=note.application_id,
            content=note.content,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )

        note_responses.append(note_response)

    return note_responses


def update_note(
    db: Session,
    note_id: int,
    data: NoteUpdate,
    current_user: User,
):
    note = db.query(Note).join(Application).filter(
        Note.id == note_id,
        Application.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    note.content = data.content

    db.commit()
    db.refresh(note)

    note_response = NoteResponse(
        id=note.id,
        application_id=note.application_id,
        content=note.content,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )

    return note_response



def delete_note(
    db: Session,
    note_id: int,
    current_user: User,
):
    note = db.query(Note).join(Application).filter(
        Note.id == note_id,
        Application.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    db.delete(note)
    db.commit()

    return {"message": "Note deleted successfully"}