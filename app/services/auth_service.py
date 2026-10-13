from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.utils.security import hash_password, verify_password
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError


def register_user(db: Session, data: UserCreate):

    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="User already exists"
        )
    
    hashed_password = hash_password(data.password)

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hashed_password
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return {
            "message": "User registered successfully",
            "data": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at,
            }
        }
        
    
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Registration Failed try again"
        ) from exc



def login_user(db: Session, data: UserLogin):

    user = db.query(User).filter(User.email == data.email).first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail = "Invalid Email or Password"
        )

    return user


