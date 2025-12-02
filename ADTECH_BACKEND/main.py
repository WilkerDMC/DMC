from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_HOURS= int (os.getenv("ACCESS_TOKEN_EXPIRE_HOURS"))
MONGO_URL = os.getenv("MONGO_URL")

@asynccontextmanager
async def lifespan(FastAPI):
      try:
          app.mongodb_client.get_defaut_database()
          app.database = app.mongodb_client.get_default_database()
          print("✅ Conectado ao MongoDB com sucesso!")
          yield
      except Exception as e:
          print(f"❌ Erro ao conectar no MongoDB: {e}")
      finally:
           if hasattr(app,'mongodb_client'):
                app.mongodb_client.closer()
                print("🛑 Conexão com MongoDB Fechada.")

app = FastAPI(lifespan=lifespan)

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_schema = OAuth2PasswordBearer(tokenUrl="auth/login-form")

from auth_routes import auth_router

app.include_router(auth_router)
