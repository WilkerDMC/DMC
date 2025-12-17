from sqlachemy import create_engine, Column, Integer, String, Boolean
from sqlachemy.orm import declarative_base

db = create_engine("sqlite:///banco.db")
Base = declarative_base()

class User(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, autoincrement=True)

    self = Column("self", String)
    name = Column("name", String)
    email = Column("email", String, unique=True, index=True)
    password = Column("password", String)
    number_cnj = Column("number_cnj", String)

    # Opcional
    number_oab = Column("number_oab", String, nullable = True)

    # Tipo de usuário (cliente, advogado e cartório)
    user_type = Column("user", String, nullable=False, default="CLIENTE")

    ativo = Column("ativo", Boolean, default=True)
    admin = Column("admin", Boolean, default=False)

def __init__(
  self,
  name,
  email,
  password,
  number_cnj=None,
  number_oab=None,
  user_type="CLIENTE",
  ativo=True,
  admin=False,
):
  self.name = name
  self.email = email
  self.password = password
  self.number_cnj = number_cnj
  self.number_oab = number_oab
  self.user_type = user_type
  self.ativo = ativo
  self.admin = admin

  def to_dict(self):
    return {
      "id": self.id,
      "self": self.self,
      "name": self.name,
      "email": self.email,
      "password": self.password,
      "number_cnj": self.number_cnj,
      "number_oab": self.number_oab,
      "user_type": self.user_type,
      "ativo": self.ativo,
      "admin": self.admin
    }

  def __repr__ (self):
    return f"<Usuario id={self.id} email={self.email!r} user_type={self.user_type!r}"
