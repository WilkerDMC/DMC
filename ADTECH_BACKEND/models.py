from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base
from sqlalchemy_utils.types import ChoiceType
from fastapi import APIRouter, HTTPException, Depends, status
db = create_engine("sqlite:///banco.db")

Base = declarative_base()

class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, autoincrement=True)

    self = Column("self", String)
    nome = Column("nome", String)
    email = Column("email", String, unique=True, index=True)
    senha = Column("senha", String)
    numero_cartorio = Column ("numero_cartorio", String)
    ativo = Column ("ativo", Boolean)
    admin = Column ("admin", Boolean, default=True)

def __init__(self, nome, email, senha, numero_cartorio, ativo=True, admin=False):

    self.nome = nome
    self.email = email
    self.senha = senha
    self.numero_cartorio = numero_cartorio
