import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import http.client
import json

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/dashboard")
API_HOST = "127.0.0.1"
API_PORT = 8000

async def verify_mongodb():
    print("--- Verifying MongoDB ---")
    try:
        client = AsyncIOMotorClient(MONGODB_URI)
        db = client.get_default_database()
        print(f"Connected to database: {db.name}")
        
        collections = await db.list_collection_names()
        print(f"Collections: {collections}")
        
        for coll_name in ["livelaw", "ichr"]:
            count = await db[coll_name].count_documents({})
            print(f"Collection '{coll_name}' has {count} documents.")
            if count > 0:
                sample = await db[coll_name].find_one()
                print(f"Sample document keys: {list(sample.keys())}")
    except Exception as e:
        print(f"MongoDB Error: {e}")

def verify_api():
    print("\n--- Verifying FastAPI ---")
    try:
        conn = http.client.HTTPConnection(API_HOST, API_PORT)
        
        # Root
        conn.request("GET", "/")
        res = conn.getresponse()
        print(f"Root endpoint: {res.status} - {res.read().decode()}")
        
        # Livelaw
        conn.request("GET", "/livelaw/?limit=1")
        res = conn.getresponse()
        print(f"Livelaw endpoint: {res.status}")
        if res.status == 200:
            data = json.loads(res.read().decode())
            print(f"Livelaw doc count returned: {len(data.get('documents', []))}")
            
        # ICHR
        conn.request("GET", "/ichr/?limit=1")
        res = conn.getresponse()
        print(f"ICHR endpoint: {res.status}")
        if res.status == 200:
            data = json.loads(res.read().decode())
            print(f"ICHR doc count returned: {len(data.get('documents', []))}")
            
    except Exception as e:
        print(f"API Error: {e}")

if __name__ == "__main__":
    asyncio.run(verify_mongodb())
    verify_api()
