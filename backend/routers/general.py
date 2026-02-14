from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from database import db
from datetime import datetime
import asyncio

router = APIRouter(
    tags=["general"]
)

def _strip_object_ids(obj):
    """Recursively convert ObjectId values to strings so FastAPI can serialize them."""
    from bson import ObjectId
    if isinstance(obj, dict):
        return {k: _strip_object_ids(v) for k, v in obj.items() if k != "_id" or True}
    if isinstance(obj, list):
        return [_strip_object_ids(i) for i in obj]
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj

def serialize_doc(doc, doc_type):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    doc["_type"] = doc_type

    # Strip ObjectIds from nested gazette_details
    if "gazette_details" in doc and isinstance(doc["gazette_details"], dict):
        gd = doc["gazette_details"]
        if "_id" in gd:
            del gd["_id"]
        doc["gazette_details"] = _strip_object_ids(gd)

    # Add timestamp field for uniform sorting
    if doc_type == "livelaw":
        pub_at = doc.get("published_at")
        if isinstance(pub_at, str):
            try:
                # Remove Z if present for fromisoformat
                clean_date = pub_at.replace("Z", "+00:00")
                doc["_timestamp"] = datetime.fromisoformat(clean_date).timestamp() * 1000
            except:
                doc["_timestamp"] = 0
        else:
            doc["_timestamp"] = pub_at or 0
    elif doc_type == "ichr":
        date_val = doc.get("Date")
        if isinstance(date_val, str):
            try:
                doc["_timestamp"] = datetime.strptime(date_val, "%d.%m.%Y").timestamp() * 1000
            except:
                doc["_timestamp"] = 0
        else:
             doc["_timestamp"] = date_val or 0
             
        if "Attachments" in doc:
            doc["attachments"] = doc["Attachments"]
    elif doc_type == "gazette":
        # Processed alerts are gazettes in the UI
        date_val = doc.get("gazette_details", {}).get("publish_date")
        if isinstance(date_val, str):
            try:
                # Parse DD/MM/YYYY format
                doc["_timestamp"] = datetime.strptime(date_val, "%d/%m/%Y").timestamp() * 1000
            except:
                doc["_timestamp"] = 0
        else:
             doc["_timestamp"] = 0
        
    doc["_score"] = 1.0 # default score
    return doc

@router.get("/all")
async def get_all_summary():
    try:
        # Fetch latest 3 from livelaw
        livelaw_cursor = db.livelaw.find({}).sort("published_at", -1).limit(3)
        livelaw_docs = await livelaw_cursor.to_list(length=3)
        
        # Fetch latest 3 from ichr
        ichr_cursor = db.ichr.find({}).sort("Date", -1).limit(3)
        ichr_docs = await ichr_cursor.to_list(length=3)
        
        return {
            "livelaw": [serialize_doc(doc, "livelaw") for doc in livelaw_docs],
            "ichr": [serialize_doc(doc, "ichr") for doc in ichr_docs],
            "total": len(livelaw_docs) + len(ichr_docs)
        }
    except Exception as e:
        print(f"Error fetching summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch summary data")

@router.get("/search")
async def global_search(
    query: Optional[str] = None,
    site: Optional[str] = None, # "livelaw", "ichr", "gazette", or ""
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    sortBy: str = "", # "newest", "oldest", or "" (relevance)
    limit: int = 20
):
    try:
        search_livelaw = not site or site == "livelaw"
        search_ichr = not site or site == "ichr"
        search_gazette = not site or site == "gazette"
        
        livelaw_results = []
        ichr_results = []
        gazette_results = []
        
        regex_query = {"$regex": query, "$options": "i"} if query else None
        
        if search_livelaw:
            mongo_query = {}
            if regex_query:
                mongo_query["$or"] = [
                    {"title": regex_query},
                    {"summary": regex_query},
                    {"relevance_reason": regex_query},
                    {"author": regex_query},
                    {"source": regex_query}
                ]
            
            # Livelaw ISO Date Filter
            if startDate or endDate:
                livelaw_date_filter = {}
                if startDate:
                     livelaw_date_filter["$gte"] = f"{startDate}T00:00:00"
                if endDate:
                     livelaw_date_filter["$lte"] = f"{endDate}T23:59:59"
                if livelaw_date_filter:
                    mongo_query["published_at"] = livelaw_date_filter
            
            cursor = db.livelaw.find(mongo_query)
            if sortBy == "oldest":
                cursor.sort("published_at", 1)
            elif sortBy == "newest":
                cursor.sort("published_at", -1)
            
            livelaw_results = await cursor.limit(limit).to_list(length=limit)
            
        if search_ichr:
            mongo_query = {}
            if regex_query:
                mongo_query["$or"] = [
                    {"title": regex_query},
                    {"summary": regex_query},
                    {"content": regex_query},
                    {"Place": regex_query},
                    {"place": regex_query},
                    {"site": regex_query}
                ]
            
            # ICHR DD.MM.YYYY Date Filter using $expr
            if startDate or endDate:
                ichr_expr_conds = []
                if startDate:
                    try:
                        start_dt = datetime.fromisoformat(startDate)
                        ichr_expr_conds.append({
                            "$gte": [
                                {"$dateFromString": {"dateString": "$Date", "format": "%d.%m.%Y", "onError": datetime(1970, 1, 1), "onNull": datetime(1970, 1, 1)}},
                                start_dt
                            ]
                        })
                    except: pass
                if endDate:
                    try:
                        end_dt = datetime.fromisoformat(endDate).replace(hour=23, minute=59, second=59)
                        ichr_expr_conds.append({
                            "$lte": [
                                {"$dateFromString": {"dateString": "$Date", "format": "%d.%m.%Y", "onError": datetime(1970, 1, 1), "onNull": datetime(1970, 1, 1)}},
                                end_dt
                            ]
                        })
                    except: pass
                if ichr_expr_conds:
                    mongo_query["$expr"] = {"$and": ichr_expr_conds}

            cursor = db.ichr.find(mongo_query)
            if sortBy == "oldest":
                cursor.sort("Date", 1)
            elif sortBy == "newest":
                cursor.sort("Date", -1)
            ichr_results = await cursor.limit(limit).to_list(length=limit)

        if search_gazette:
            # Only search processed alerts (slack_sent=True) joined with gazette details
            try:
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
                    {"$unwind": "$gazette_details"}
                ]

                if regex_query:
                    pipeline.append({
                        "$match": {
                            "$or": [
                                {"summary": regex_query},
                                {"reason": regex_query},
                                {"gazette_details.ministry": regex_query},
                                {"gazette_details.subject": regex_query},
                                {"gazette_details.pdf_text": regex_query}
                            ]
                        }
                    })

                if startDate or endDate:
                    gazette_expr_conds = []
                    # Gazette dates are stored as DD/MM/YYYY string
                    if startDate:
                        try:
                            start_dt = datetime.fromisoformat(startDate)
                            gazette_expr_conds.append({
                                "$gte": [
                                    {"$dateFromString": {"dateString": "$gazette_details.publish_date", "format": "%d/%m/%Y", "onError": datetime(1970, 1, 1), "onNull": datetime(1970, 1, 1)}},
                                    start_dt
                                ]
                            })
                        except: pass
                    if endDate:
                        try:
                            # Set end date to end of day
                            end_dt = datetime.fromisoformat(endDate).replace(hour=23, minute=59, second=59)
                            gazette_expr_conds.append({
                                "$lte": [
                                    {"$dateFromString": {"dateString": "$gazette_details.publish_date", "format": "%d/%m/%Y", "onError": datetime(1970, 1, 1), "onNull": datetime(1970, 1, 1)}},
                                    end_dt
                                ]
                            })
                        except: pass
                    
                    if gazette_expr_conds:
                        pipeline.append({"$match": {"$expr": {"$and": gazette_expr_conds}}})

                sort_order = 1 if sortBy == "oldest" else -1
                pipeline.append({"$sort": {"alerted_at": sort_order}})
                pipeline.append({"$limit": limit})

                cursor = db.alerts.aggregate(pipeline)
                gazette_results = await cursor.to_list(length=limit)
                print(f"[DEBUG] Found {len(gazette_results)} gazette results")

            except Exception as e:
                print(f"[ERROR] Gazette search failed: {e}")
                import traceback
                traceback.print_exc()
                gazette_results = []


        formatted_livelaw = [serialize_doc(doc, "livelaw") for doc in livelaw_results]
        formatted_ichr = [serialize_doc(doc, "ichr") for doc in ichr_results]
        
        # Debug gazette serialization
        formatted_gazette = []
        for doc in gazette_results:
            try:
                formatted_gazette.append(serialize_doc(doc, "gazette"))
            except Exception as e:
                print(f"Error serializing gazette doc: {e}")
                print(f"Doc keys: {doc.keys() if hasattr(doc, 'keys') else 'Not a dict'}")
                import traceback
                traceback.print_exc()
        
        all_results = formatted_livelaw + formatted_ichr + formatted_gazette
        
        # Combined sorting in memory using the unified numeric _timestamp
        if sortBy == "newest":
            all_results.sort(key=lambda x: x.get("_timestamp", 0) or 0, reverse=True)
        elif sortBy == "oldest":
             all_results.sort(key=lambda x: x.get("_timestamp", 0) or 0)

        # Apply limit after combining
        all_results = all_results[:limit]

        return {
            "results": all_results,
            "counts": {
                "livelaw": len(livelaw_results),
                "ichr": len(ichr_results),
                "gazette": len(gazette_results)
            }
        }

    except Exception as e:
        import traceback
        print(f"Global search error: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

