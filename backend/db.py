# backend/db.py

import os
import psycopg2
import psycopg2.extras
import uuid
from dotenv import load_dotenv

load_dotenv()

# ✅ Garante que UUID do Python seja aceito automaticamente pelo psycopg2
psycopg2.extras.register_uuid()

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
conn.autocommit = True
cursor = conn.cursor()
