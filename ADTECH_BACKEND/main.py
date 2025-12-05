from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

# Pegar variáveis
MONGO_URL = os.getenv("MONGO_URL") # Ex: mongodb://localhost:27017
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

# Gerenciador de Vida do Banco
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Conecta
    app.mongodb_client = AsyncIOMotorClient(MONGO_URL)
    app.database = app.mongodb_client.get_default_database() # Pega o banco da URL
    print("✅ MongoDB Conectado!")
    yield
    # Desconecta
    app.mongodb_client.close()
    print("🛑 MongoDB Desconectado.")

app = FastAPI(lifespan=lifespan)

# Importar rotas DEPOIS de criar o app
from auth_routes import auth_router
app.include_router(auth_router)
