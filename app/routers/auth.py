from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate, UserLogin
from app.services.auth_service import register_user, login_user
from app.utils.dependencies import get_db
from pydantic import BaseModel
from app.utils.security import create_access_token



router = APIRouter()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"



@router.post("/register")
def register(data: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, data)


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = login_user(db, data)

    token = create_access_token({
        "sub": str(user.id)
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
