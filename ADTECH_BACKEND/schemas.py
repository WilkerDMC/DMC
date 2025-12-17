from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel, ConfigDict

# Campos necessários para criação de usuário
class UsuarioSchema(BaseModel):
    nome:str
    email:str
    senha:str
    numero_cartorio:str

model_config = ConfigDict(from_attributes=True)

# Campos para login
class LoginSchema(BaseModel):
    email:str
    senha:str

model_config = ConfigDict(from_attributes=True)
