import requests # pyright: ignore[reportMissingModuleSource]

headers = {

    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJzdWIiOiJqb2FvQGdtYWlsLmNvbSIsImV4cCI6MTc2NDk2NDc0NH0.5fXMlpHN4c0pmLAuhziaFr0fvsrv7xJvjm-0E18nM64"
}
requisicao = requests.get("http://127.0.0.1:8000/auth/refresh", headers=headers)

print(requisicao)

print(requisicao.json())
