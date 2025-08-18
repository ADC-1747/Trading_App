from pydantic import BaseModel, EmailStr, constr

class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: constr(min_length=6)
    role: constr(to_lower=True, pattern="^(trader)$") = "trader"

class UserLogin(BaseModel):
    username: constr(min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True
