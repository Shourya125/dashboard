#!/usr/bin/env python3
"""Direct test of the Gazette search aggregation pipeline"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def test_gazette_search():
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.dashboard
    
    print("Testing Gazette search aggregation...")
    
    # Test the pipeline
    pipeline = [
        {"$match": {"slack_sent": True}},
        {
            "$lookup": {
                "from": "gazettes",
                "localField": "gazette_id",
                "foreignField": "gazette_id",
                "as": "gazette_details"
            }
        },
        {"$unwind": "$gazette_details"},
        {"$limit": 5}
    ]
    
    try:
        cursor = db.alerts.aggregate(pipeline)
        results = await cursor.to_list(length=5)
        
        print(f"Found {len(results)} gazette results")
        
        if results:
            print("\nFirst result structure:")
            first = results[0]
            print(f"  - gazette_id: {first.get('gazette_id')}")
            print(f"  - summary: {first.get('summary', '')[:50]}...")
            print(f"  - gazette_details.ministry: {first.get('gazette_details', {}).get('ministry')}")
            print(f"  - gazette_details.publish_date: {first.get('gazette_details', {}).get('publish_date')}")
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_gazette_search())
