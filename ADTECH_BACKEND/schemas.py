from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel, ConfigDict

class UsuarioSchema(BaseModel):
    nome:str
    email:str
    senha:str
    numero_cartorio:str

model_config = ConfigDict(from_attributes=True)

class LoginSchema(BaseModel):
    email:str
    senha:str

model_config = ConfigDict(from_attributes=True)
