from fastapi import APIRouter, HTTPException, Depends, status, Request
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, ACCESS_TOKEN_EXPIRE_HOURS
from schemas import UsuarioSchema, LoginSchema
from main import SECRET_KEY, ALGORITHM

auth_router = APIRouter(prefix="/auth", tags=["auth"])
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#Função_Auxiliar_para_pegar_o_banco_da_requisição

def get_database(request: Request):
    return request.app.database

#Rota Criar Conta (MongoDB)
@auth_router.post("/criar_conta", status_code=201)
async def criar_conta(usuario: UsuarioSchema, db = Depends(get_database)):

    # 1. Busca no Mongo (find_one)
    usuario_existente = await db["usuarios"].find_one({"email": usuario.email})

    if usuario_existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    # 2. Prepara o JSON para salvar
    novo_usuario_dict = usuario.model_dump() # Converte Schema para Dicionário
    novo_usuario_dict["senha"] = bcrypt_context.hash(usuario.senha) # Criptografa
    novo_usuario_dict["ativo"] = True
    novo_usuario_dict["admin"] = False

    # 3. Insere no Mongo (insert_one)
    resultado = await db["usuarios"].insert_one(novo_usuario_dict)

    # O Mongo retorna o _id (ObjectId), convertemos para string
    return {"id": str(resultado.inserted_id), "mensagem": "Criado com sucesso!"}

#Rota Login (MongoDB)
@auth_router.post("/login")
async def login(login_data: LoginSchema, db = Depends(get_database)):

    #Busca usuário
    usuario = await db["usuarios"].find_one({"email": login_data.email})

    #Verifica se existe uma senha cadastrada e se bate com a que foi verificada
    if not usuario or not bcrypt_context.verify(login_data.senha, usuario["senha"]):
        raise HTTPException(status_code=400, detail="Credenciais inválidas")

    #Gera Token
    token = criar_token(usuario["email"], str(usuario["_id"]))

    return {"access_token": token, "token_type": "bearer"}

def criar_token(email: str, id_usuario: str, duracao_token: timedelta = None):
    # Se você mandou uma duração específica (ex: 7 dias para o Refresh Token), usa ela.
    if duracao_token:
        data_expiracao = datetime.now(timezone.utc) + duracao_token

    else:
        data_expiracao = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

    dic_info = {
        "user_id": id_usuario,
        "sub": email,
        "exp": data_expiracao
    }

    token = jwt.encode(dic_info, SECRET_KEY, algorithm=ALGORITHM)
    return token

    pass
