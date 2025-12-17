from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator, model_validator

class UserType(str, Enum):
    CLIENTE = "CLIENTE"
    ADVOGADO = "ADVOGADO"
    CARTORIO = "CARTORIO"

class UsuarioSchema(BaseModel):

    name: str
    email:EmailStr
    password: str = Field(min_length=8)
    user_type: UserType = Field(...)

    number_cnj: Optional[str] = None
    oab_number: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, v: str) -> str:
        if not any(c.isalpha() for c in v) or not any(c.isdigit() for c in v):
          raise ValueError("The password must contain letters and numbers")
        return v

    @model_validator(mode="after")
    @classmethod
    def validate_by_user_type (cls, model):
        if model.user_type == UserType.ADVOGADO:
            if not model.oab_number or not model.numero_cartorio.strip():
                raise ValueError ("OAB number is required for ADVOGADO user type")
            if model.user_type == UserType.CARTORIO:
                  raise ValueError ("Cartorio number is required for CARTORIO user type")
        return model


    class LoginSchema(BaseModel):
      email: EmailStr
      password: str

    model_config= ConfigDict(from_attributes=True)
