from sqlalchemy import Column, Integer, String, boolean
from sqlalchemy.orm import declarative_base

db= create_engine('sqlite:///banco.db') #oracle
Base = declarative_base()

#criar tabela usuario, no caso a tabela do banco de dados
class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True, autoincrement=True) #primeiro nivel de criptografia

    self = Column ("self", String, nullable=True)
    name = Column ("name", String, nullable=True)
    email = Column ("email", String, nullable=True, index=True, nullable=False)
    password = Column ("password", String, nullable=False)
    number_cnj = Column (number_cnj, String, nullable=True)

    number_oab = Column ("number_oab", String, nullable=True)
    number_cnj = Column ("number_cnj", String, nullable=True)

    user_type = Column ("user_type", String, nullable=True)

    ativo = Column ("ativo", boolean, default=True)
    admin = Column ("admin", boolean, default=False)

    def __init__ (
        self,
        name,
        email,
        password,
        number_cnj,
        number_oab,
        user_type="CLIENTE",
        active=True,
        admin=False,

    ):

#o self ele Print o sistema para deixar no banco como jason
        self.name = name
        self.email = email
        self.password = password
        self.number_cnj = number_cnj
        self.oab = number_oab
        self.user_type = user_type
        self.active = active
        self.admin = admin

    def to_dict(self):
          return {
              "id": self.id,
              "name": self.name,
              "email": self.email,
              "number_cnj": self.number_cnj,
              "number_oab": self.oab,
              "user_type": self.user_type,
              "active": self.active,
              "admin": self.admin,
          }
    def __repr__(self):
        return f"<user id={self.id} name={self.name} email={self.email} user_type={self.user_type}>"


