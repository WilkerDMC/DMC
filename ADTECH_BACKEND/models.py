from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base

db = create_engine("sqlite:///banco.db")
Base = declarative_base()


class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # kept name "self" because it existed in the original schema; avoid using Python reserved word for attribute access
    self = Column("self", String, nullable=True)
    nome = Column("nome", String, nullable=True)
    email = Column("email", String, unique=True, index=True, nullable=False)
    senha = Column("senha", String, nullable=False)
    numero_cartorio = Column("numero_cartorio", String, nullable=True)

    # New optional fields requested
    oab = Column("oab", String, nullable=True)            # for ADVOGADO
    numero_cnj = Column("numero_cnj", String, nullable=True)  # for CARTORIO

    # user type to distinguish CLIENTE / ADVOGADO / CARTORIO
    user_type = Column("user_type", String, nullable=False, default="CLIENTE")

    ativo = Column("ativo", Boolean, default=True)
    admin = Column("admin", Boolean, default=False)

    def __init__(
        self,
        nome,
        email,
        senha,
        numero_cartorio=None,
        oab=None,
        numero_cnj=None,
        user_type="CLIENTE",
        ativo=True,
        admin=False,
    ):
        self.nome = nome
        self.email = email
        self.senha = senha
        self.numero_cartorio = numero_cartorio
        self.oab = oab
        self.numero_cnj = numero_cnj
        self.user_type = user_type
        self.ativo = ativo
        self.admin = admin

    def to_dict(self):
        """
        Return a dict representation safe for responses: never include the password.
        Use this in places where model instances are converted to JSON to ensure senha is not leaked.
        """
        return {
            "id": self.id,
            "self": self.self,
            "nome": self.nome,
            "email": self.email,
            "numero_cartorio": self.numero_cartorio,
            "oab": self.oab,
            "numero_cnj": self.numero_cnj,
            "user_type": self.user_type,
            "ativo": self.ativo,
            "admin": self.admin,
        }

    def __repr__(self):
        return f"<Usuario id={self.id} email={self.email!r} user_type={self.user_type!r}>"