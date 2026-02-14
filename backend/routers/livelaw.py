from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from database import db
from bson import ObjectId
from datetime import datetime

router = APIRouter(
    prefix="/livelaw",
    tags=["livelaw"]
)

def serialize_doc(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.get("/")
async def get_livelaw(
    query: Optional[str] = None,
    author: Optional[str] = None,
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    sortBy: str = "newest",
    limit: int = 20,
    offset: int = 0
):
    mongo_query = {}

    if query:
        mongo_query["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"summary": {"$regex": query, "$options": "i"}},
            {"relevance_reason": {"$regex": query, "$options": "i"}} 
        ]
    
    if author:
        mongo_query["author"] = {"$regex": author, "$options": "i"}
    
    if startDate or endDate:
        date_filter = {}
        if startDate:
            # startDate is YYYY-MM-DD from frontend
            # Lexicographical comparison works for ISO strings
            date_filter["$gte"] = f"{startDate}T00:00:00"
        
        if endDate:
            # Inclusive: up to the end of the day
            date_filter["$lte"] = f"{endDate}T23:59:59"
        
        if date_filter:
            mongo_query["published_at"] = date_filter

    sort_criteria = [("published_at", -1)] # Default newest
    if sortBy == "oldest":
        sort_criteria = [("published_at", 1)]
    
    # Execute query
    cursor = db.livelaw.find(mongo_query)
    cursor.sort(sort_criteria).skip(offset).limit(limit)
    
    documents = await cursor.to_list(length=limit)
    
    # Get total count (for pagination)
    total_hits = await db.livelaw.count_documents(mongo_query)
    
    serialized_docs = [serialize_doc(doc) for doc in documents]

    return {
        "documents": serialized_docs,
        "totalHits": total_hits,
        "offset": offset,
        "limit": limit,
        "hasMore": (offset + limit) < total_hits
    }

@router.get("/{id}")
async def get_livelaw_by_id(id: str):
    try:
        # Try both ObjectId and string ID just in case
        try:
             obj_id = ObjectId(id)
             doc = await db.livelaw.find_one({"_id": obj_id})
        except:
             doc = await db.livelaw.find_one({"_id": id})

        if not doc:
             # Fallback: sometimes _id might be a string but not an ObjectId
             doc = await db.livelaw.find_one({"id": id})
        
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
            
        return serialize_doc(doc)
    except Exception as e:
        print(f"Error fetching document: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
