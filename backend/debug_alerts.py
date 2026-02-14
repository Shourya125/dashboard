import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def debug_alerts():
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.dashboard
    
    print(f"Connected to db: {db.name}")
    
    collections = await db.list_collection_names()
    print(f"Collections: {collections}")
    
    if "alerts" not in collections:
        print("CRITICAL: alerts collection not found!")
    
    pipeline = [
        {
            "$lookup": {
                "from": "gazettes",
                "localField": "gazette_id",
                "foreignField": "gazette_id",
                "as": "gazette_details"
            }
        },
        {
            "$unwind": {
                "path": "$gazette_details",
                "preserveNullAndEmptyArrays": True
            }
        }
    ]
    
    print("Testing aggregate pipeline...")
    try:
        cursor = db.alerts.aggregate(pipeline)
        alerts = await cursor.to_list(length=5)
        print(f"Found {len(alerts)} alerts after join.")
        for a in alerts:
            print(f"Alert ID: {a['_id']}, Gazette Details present: {bool(a.get('gazette_details'))}")
    except Exception as e:
        print(f"Aggregate failed: {e}")

    await client.close()

if __name__ == "__main__":
    asyncio.run(debug_alerts())
