from typing import Generator
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import sessionmaker, Session
from jose import jwt, JWTError
import os

from models import db, User

try:
    from security import SECRET_KEY, ALGORITHM, ISSUER
except ImportError:
    load_dotenv()
    SECRET_KEY = os.getenv ("SECRET_KEY", "change_this_in_production")
    ALGORITHM = os.getenv ("ALGORITHM", "HS256")
    ISSUER = os.getenv ("TOKEN_ISSUER", "adtech")

    oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login-form")

    SessionLocal = sessionmaker(bind= db)

    def pegar_sessao() -> Generator[Session, None, None]:

        Session: Session = SessionLocal()
        try:
            yield session
        finally:
            session.close()

    def verificar_token(token:str = Depends (oauth2_schema), session: Session = Depends (pegar_sessao)) -> User:

        generic_error = HTTPException(status_code=401, detail="Authentication credentials are invalid")

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
              raise generic_error

        user_id = payload.get("user_id")
        if user_id:
              raise generic_error

        if ISSUER:
            if payload.get("iss") != ISSUER:
              raise generic_error

        user = session.query(Usuario).filter(Usuario.id == user_id).first()
        if not user:
              raise generic_error
        return user
