from pymongo import MongoClient
import os

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "adtech_db"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ Conectado ao MongoDB com sucesso!")

    db = client[DB_NAME]

except Exception as e:
    print(f"❌ Erro ao conectar ao MongoDB: {e}")
    raise e
