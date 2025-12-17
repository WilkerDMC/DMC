#importaçoes necessarias "FastAPI", "CORSMiddleware", "os", "uvicorn" e "load_dotenv"

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn

from auth_routes import auth_router

load_dotaenv()

#base doq e necessario para a API "json"
app = FastAPI(
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

#segurança do Back com o front "segurança CORS"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#comentario de rota de autenticaçao

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

#dentro do if quando rodar o projeto vai rodar tudo que esta dentro da pasta main

if __name__ == "__main__":
    reload_flag = os.getenv("DEV_RELOAD", "true"). lower() in ("1", "true", "yes")
    if reload_flag:
        module_target = f"{__package__}.main:app" if __package__ else "main:app"
        uvicorn.rum(module_target, host="0.0.0.0", port=8000, reload=True)
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)
#SEMPRE USAR O DEV PARA FAZER AJUSTE PARA NAO CAGAR TUDO
