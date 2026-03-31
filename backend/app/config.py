import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./interactions.db"  # for quick local dev; can switch to MySQL/Postgres
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "gemma2-9b-it"