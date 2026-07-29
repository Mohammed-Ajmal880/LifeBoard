from pydantic import BaseModel, EmailStr
from uuid import UUID

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: UUID
    username: str
    email: str
    class Config:
        from_attributes=True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

