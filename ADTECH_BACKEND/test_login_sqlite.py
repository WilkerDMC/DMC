from fastapi.testclient import TestClient
from main import app
from models import Usuario, db as engine
from sqlalchemy.orm import sessionmaker
import random

client = TestClient(app)

def test_criar_usuario_real():
    numero = random.randint(1, 9999)
    email_teste = f"usuario_real_{numero}@teste.com"
    senha_teste = "senha123"

    print(f"\n🚀 Iniciando teste para: {email_teste}")

    payload = {
        "nome": "Usuário Teste SQLite",
        "email": email_teste,
        "senha": senha_teste,
        "numero_cartorio": "Cartório 5"
    }

    response = client.post("/auth/criar_conta", json=payload)

    assert response.status_code == 201
    print("✅ Usuário criado via API!")

    Session = sessionmaker(bind=engine)
    session = Session()

    usuario_no_banco = session.query(Usuario).filter(Usuario.email == email_teste).first()

    assert usuario_no_banco is not None
    print(f"🎉 SUCESSO! Encontrei o usuário {usuario_no_banco.nome} (ID: {usuario_no_banco.id}) dentro do banco.db")

    session.close()
