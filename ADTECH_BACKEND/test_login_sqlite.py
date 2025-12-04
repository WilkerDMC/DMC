from fastapi.testclient import TestClient
from main import app
from models import Usuario, db as engine
from sqlalchemy.orm import sessionmaker
import random

# Cria o cliente para fazer requisições na API
client = TestClient(app)

def test_criar_usuario_real():
    # 1. Gera um e-mail único para não dar erro de duplicidade
    numero = random.randint(1, 9999)
    email_teste = f"usuario_real_{numero}@teste.com"
    senha_teste = "senha123"

    print(f"\n🚀 Iniciando teste para: {email_teste}")

    # 2. Manda criar a conta (Isso vai salvar no banco.db)
    payload = {
        "nome": "Usuário Teste SQLite",
        "email": email_teste,
        "senha": senha_teste,
        "numero_cartorio": "Cartório 5"
    }

    response = client.post("/auth/criar_conta", json=payload)

    # 3. Verifica se deu certo (201 Created)
    assert response.status_code == 201
    print("✅ Usuário criado via API!")

    # 4. (O Pulo do Gato) Vamos olhar direto no banco para provar que está lá
    Session = sessionmaker(bind=engine)
    session = Session()

    usuario_no_banco = session.query(Usuario).filter(Usuario.email == email_teste).first()

    assert usuario_no_banco is not None
    print(f"🎉 SUCESSO! Encontrei o usuário {usuario_no_banco.nome} (ID: {usuario_no_banco.id}) dentro do banco.db")

    session.close()
