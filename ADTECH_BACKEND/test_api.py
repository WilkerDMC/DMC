from fastapi.testclient import TestClient
from main import app
import random

client = TestClient(app)

def test_fluxo_completo_criaçao_de_cadastro_e_login():

    random_id = random.randint(1, 100000)
    email_teste = f"usuario_teste_{random_id}@gmail.com"
    senha_teste = "senha123"

    payload_cadastro = {
        "nome": "Testador Pytest",
        "email": email_teste,
        "senha": senha_teste,
        "numero_cartorio": "Cartório 001"
    }

    print(f"\nTentando criar usuário: {email_teste}")
    response_cadastro = client.post("/auth/criar_conta", json=payload_cadastro)

    assert response_cadastro.status_code == 201, f"Erro ao criar: {response_cadastro.text}"
    print("✅ Usuário criado com sucesso!")


    payload_login = {
        "email": email_teste,
        "senha": senha_teste
    }

    print("Tentando fazer login...")
    response_login = client.post("/auth/login", json=payload_login)

    assert response_login.status_code == 200, f"Erro ao logar: {response_login.text}"


    dados = response_login.json()
    assert "access_token" in dados
    assert "refresh_token" in dados
    assert dados["token_type"] == "Bearer"

    print("✅ Login realizado e Tokens recebidos!")
