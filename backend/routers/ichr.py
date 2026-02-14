from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from database import db
from bson import ObjectId
from datetime import datetime

router = APIRouter(
    prefix="/ichr",
    tags=["ichr"]
)

def serialize_doc(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    if "Attachments" in doc:
        doc["attachments"] = doc["Attachments"]
    return doc

@router.get("/")
async def get_ichr(
    query: Optional[str] = None,
    place: Optional[str] = None,
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    sortBy: str = "newest",
    limit: int = 20,
    offset: int = 0
):
    mongo_query = {}
    
    conditions = []
    
    if query:
        conditions.append({
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"summary": {"$regex": query, "$options": "i"}},
                {"content": {"$regex": query, "$options": "i"}}
            ]
        })
    
    if place:
        conditions.append({
            "$or": [
                {"Place": {"$regex": place, "$options": "i"}},
                {"place": {"$regex": place, "$options": "i"}}
            ]
        })

    if conditions:
        mongo_query["$and"] = conditions

    # Date filtering for DD.MM.YYYY format
    if startDate or endDate:
        conditions = []
        if startDate:
            try:
                start_dt = datetime.fromisoformat(startDate)
                conditions.append({
                    "$gte": [
                        {"$dateFromString": {"dateString": "$Date", "format": "%d.%m.%Y", "onError": datetime(1970, 1, 1), "onNull": datetime(1970, 1, 1)}},
                        start_dt
                    ]
                })
            except ValueError:
                pass
            
        if endDate:
            try:
                # Inclusive end date
                end_dt = datetime.fromisoformat(endDate).replace(hour=23, minute=59, second=59)
                conditions.append({
                    "$lte": [
                        {"$dateFromString": {"dateString": "$Date", "format": "%d.%m.%Y", "onError": datetime(1970, 1, 1), "onNull": datetime(1970, 1, 1)}},
                        end_dt
                    ]
                })
            except ValueError:
                pass
            
        if conditions:
            mongo_query["$expr"] = {"$and": conditions}

    sort_criteria = [("Date", -1)] # Default newest
    if sortBy == "oldest":
        sort_criteria = [("Date", 1)]

    # execute query
    cursor = db.ichr.find(mongo_query)
    cursor.sort(sort_criteria).skip(offset).limit(limit)
    
    try:
        documents = await cursor.to_list(length=limit)
        total_hits = await db.ichr.count_documents(mongo_query)
        
        serialized_docs = [serialize_doc(doc) for doc in documents]
        
        return {
            "documents": serialized_docs,
            "totalHits": total_hits,
            "offset": offset,
            "limit": limit,
            "hasMore": (offset + limit) < total_hits
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}")
async def get_ichr_by_id(id: str):
    try:
        try:
            obj_id = ObjectId(id)
            doc = await db.ichr.find_one({"_id": obj_id})
        except:
             # Fallback if ID is not a valid ObjectId string
            doc = await db.ichr.find_one({"_id": id})
            
        if not doc:
            # Fallback based on original logic or possiblity of custom ID field
            doc = await db.ichr.find_one({"id": id})

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        return serialize_doc(doc)
    except Exception as e:
        print(f"Error fetching ICHR document: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
