from pydantic import BaseModel, Field,field_validator, EmailStr

class UserCreate(BaseModel):
    name: str = Field(..., description="Enter user name: ", min=3)
    email: EmailStr = Field(..., description="Enter mail id: ")
    password: str = Field(..., description="Enter password: ")

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:

        if len(password) < 8:
            raise ValueError("Password must contain at least 8 characters")

        if not any(char.isupper() for char in password):
            raise ValueError("Password must contain an uppercase letter")

        if not any(char.islower() for char in password):
            raise ValueError("Password must contain a lowercase letter")

        if not any(not char.isalnum() for char in password):
            raise ValueError("Password must contain a special character")

        return password

class UserResponse(BaseModel):
    id: int
    name: str
    email: str


class UserLogin(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(...)