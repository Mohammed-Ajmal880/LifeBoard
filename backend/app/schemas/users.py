from pydantic import BaseModel, EmailStr
import uuid

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    class Config:
        from_attributes=True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

