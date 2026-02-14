from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    # Fallback for local development if .env is missing or not loaded correctly
    MONGODB_URI = "mongodb://127.0.0.1:27017/dashboard"

client = AsyncIOMotorClient(MONGODB_URI)
db = client.get_default_database()

async def verify_conn():
    try:
        await client.admin.command('ping')
        print("\n" + "="*50)
        print("MONGODB CONNECTED SUCCESSFULLY")
        print(f"Database: {db.name}")
        print("="*50 + "\n")
    except Exception as e:
        print(f"\nMONGODB CONNECTION FAILED: {e}\n")

import asyncio
# Run verification in background if loop exists
try:
    asyncio.get_running_loop()
    asyncio.create_task(verify_conn())
except RuntimeError:
    pass # No running loop, skip background verification
async def get_database():
    return db
