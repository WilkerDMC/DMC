from fastapi import FastAPI, HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_HOURS= int (os.getenv("ACCESS_TOKEN_EXPIRE_HOURS"))

app = FastAPI ()

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/auth/login")
def login(request: LoginRequest):
    if request.email == "admin@test.com" and request.password == "123":
        return {"access_token": "meu_token_aqui"}
    raise HTTPException(status_code=401, detail="Credenciais inválidas")

origins=[
    "url = http://localhost:4200/"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_schema = OAuth2PasswordBearer(tokenUrl="auth/login-form")

from auth_routes import auth_router

app.include_router(auth_router)
