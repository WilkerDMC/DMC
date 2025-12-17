from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middlewar.cors import CORSMiddeware
import os
import uvicorn

# Importação rotas
from auth_routes import auth_router

load_dotenv()

# Criando e apontando a APIs
app = FastAPI(
  openapi_url = "/api/v1/openapi.json",
  docs_url= "/api/v1/docs",
  redoc_url = "/api/v1/redoc",
)

# Confuguração CORS e de segurança
app.add_middleware(
  CORSMiddeware,
  allow_origins=["hhtp://localhost:4200"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Autenticando e incluindo a rota
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

# Quando rodar o projeto irá rodar exclusivamente o arquivo Main
# Número DMS para a porta 8000
if __name__ == "__main__":
  reload_flag = os.getenv("DEV_RELOAD", "true"). lower() in ("1", "true", "yes")
  if reload_flag:
    module_target = f"{__package__}.main:app" if __package__ else "main:app"
    uvicorn.rum(module_target, host="0.0.0.0", port=8000, reload=True)
  else:
    uvicorn.run(app, host="0.0.0.0", port=8000)
