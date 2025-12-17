from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models import Usuario
from dependencies import pegar_sessao, verificar_token
from schemas import UsuarioSchema, LoginSchema, UserType
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm
import os
import uuid

# Try to reuse centralized security settings if a security module exists.
# Fall back to environment variables and local defaults otherwise.
import importlib

_security_module = None
try:
    # Try to load an optional security module without a static import so linters don't complain
    if importlib.util.find_spec("security") is not None:
        _security_module = importlib.import_module("security")
except Exception:
    _security_module = None

if _security_module:
    try:
        # todos os meios de segurança centralizados
        SECRET_KEY = getattr(_security_module, "SECRET_KEY")
        ALGORITHM = getattr(_security_module, "ALGORITHM")
        ACCESS_TOKEN_EXPIRE_HOURS = getattr(_security_module, "ACCESS_TOKEN_EXPIRE_HOURS")
        ISSUER = getattr(_security_module, "ISSUER")
        BCRYPT_CONTEXT = getattr(_security_module, "BCRYPT_CONTEXT")
        bcrypt_context = BCRYPT_CONTEXT  # use provided CryptContext if available
    except Exception:
        # If the module is present but doesn't expose expected names, fall back to env/defaults
        _security_module = None

if not _security_module:
    SECRET_KEY = os.getenv("SECRET_KEY", "change_this_in_production")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "1"))
    ISSUER = os.getenv("TOKEN_ISSUER", "adtech")
    # local bcrypt context if not centralized
    bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

auth_router = APIRouter(prefix="/auth", tags=["auth"]) #tudo que estiver dentro do auth vai chamar aqui

#define um token com tempo de expiração

def criar_token(email: str, id_usuario: int, duracao_token: timedelta = None):
    """
    Create JWT token with standard claims.
    - Keeps existing behavior: default token lifetime uses ACCESS_TOKEN_EXPIRE_HOURS.
    - Accepts an explicit duracao_token for refresh tokens.
    - Adds iat, iss and jti claims.
    """
    now = datetime.now(timezone.utc)
    if duracao_token:
        data_expiracao = now + duracao_token
    else:
        data_expiracao = now + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

    jti = str(uuid.uuid4()) #uuid e um formato de iobjeto
    claims = {
        "user_id": id_usuario,
        "sub": email,
        "iat": int(now.timestamp()),
        "iss": ISSUER, #chave de segurança com dadta de expiração
        "jti": jti,
        "exp": data_expiracao,
    }
    token = jwt.encode(claims, SECRET_KEY, algorithm=ALGORITHM)
    return token


def autenticar_usuario(email: str, senha: str, session: Session):
    """
    Authenticate user by email and password.
    Returns the Usuario instance on success, False on failure (preserves existing behavior).
    """
    usuario = session.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        return False
    # Use the centralized/local bcrypt_context for verification
    try:
        valid = bcrypt_context.verify(senha, usuario.senha)
    except Exception:
        return False

    if not valid:
        return False

    return usuario

#de forma assincrona para o sistema jogar para o banco

@auth_router.post("/criar_conta", status_code=status.HTTP_201_CREATED)
async def criar_conta(usuario_schema: UsuarioSchema, session: Session = Depends(pegar_sessao)):
    """
    Register a user. Backend enforces user_type rules and only persists allowed fields.
    - CLIENTE: only base fields saved.
    - ADVOGADO: requires oab_number -> saved to Usuario.oab
    - CARTORIO: requires numero_cartorio -> saved to Usuario.numero_cartorio
    Uses generic error messages to avoid leaking information and ignores disallowed fields.
    """
    try:
        # Do not reveal whether the email exists; return a generic failure on conflict
        existing = session.query(Usuario).filter(Usuario.email == usuario_schema.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Falha no cadastro")

        # senha embaralhada
        senha_hash = bcrypt_context.hash(usuario_schema.senha)

        # Build the new Usuario using only allowed base fields
        novo_usuario = Usuario(
            nome=usuario_schema.nome.strip() if isinstance(usuario_schema.nome, str) else usuario_schema.nome,
            email=str(usuario_schema.email).strip(),
            senha=senha_hash,
            user_type=usuario_schema.user_type.value if isinstance(usuario_schema.user_type, UserType) else str(usuario_schema.user_type),
            ativo=True,
            admin=False,
        )

        # Enforce and persist only the backend-approved fields per user_type.
        # Never trust frontend-provided payload beyond validated fields from UsuarioSchema.
        if usuario_schema.user_type == UserType.CARTORIO:
            numero = (usuario_schema.numero_cartorio or "").strip()
            if not numero:
                # generic message
                raise HTTPException(status_code=400, detail="Falha no cadastro")
            # models.Usuario defines numero_cartorio column
            novo_usuario.numero_cartorio = numero

        elif usuario_schema.user_type == UserType.ADVOGADO:
            oab_value = (usuario_schema.oab_number or "").strip()
            if not oab_value:
                raise HTTPException(status_code=400, detail="Falha no cadastro")
            # models.Usuario defines oab column (mapped to .oab)
            novo_usuario.oab = oab_value

        # CLIENTE: do not set oab or numero_cartorio even if provided by frontend.

        session.add(novo_usuario)
        session.commit()
        session.refresh(novo_usuario)

        return {"mensagem": f"Usuario Cadastrado Com Sucesso: {usuario_schema.email}", "id": novo_usuario.id}

    except HTTPException:
        raise
    except Exception:
        session.rollback()
        # Generic error to avoid leaking internal details
        raise HTTPException(status_code=400, detail="Falha no cadastro")


@auth_router.post("/login")
async def login(login_schema: LoginSchema, session: Session = Depends(pegar_sessao)):
    """
    Login endpoint that returns access_token and refresh_token (refresh has longer lifetime).
    Response format preserved for Angular frontend compatibility.
    """
    usuario = autenticar_usuario(login_schema.email, login_schema.senha, session)
    if not usuario:
        raise HTTPException(status_code=400, detail="Usuario nao Encontrado ou Credencias nao Encontradas")

    access_token = criar_token(usuario.email, usuario.id)
    refresh_token = criar_token(usuario.email, usuario.id, duracao_token=timedelta(days=7))
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer"
    }


@auth_router.post("/login-form")
async def login_form(dados_formulario: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(pegar_sessao)):
    """
    OAuth2 password form-compatible login. Returns access_token only (preserves previous behavior).
    """
    usuario = autenticar_usuario(dados_formulario.username, dados_formulario.password, session)
    if not usuario:
        raise HTTPException(status_code=400, detail="Usuario nao Encontrado ou Credencias nao Encontradas")

    access_token = criar_token(usuario.email, usuario.id)
    return {
        "access_token": access_token,
        "token_type": "Bearer"
    }


@auth_router.get("/refresh")
async def use_refresh_token(usuario: Usuario = Depends(verificar_token)):
    """
    Issue a new access token when a valid (refresh) token is provided.
    Keeps the existing behavior and response format.
    """
    access_token = criar_token(usuario.email, usuario.id)
    return {
        "access_token": access_token,
        "token_type": "Bearer"
    }
