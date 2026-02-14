from fastapi import APIRouter, HTTPException, Body
from typing import Optional, List
from database import db
from bson import ObjectId
from datetime import datetime

router = APIRouter(
    prefix="/alerts",
    tags=["alerts"]
)

def serialize_doc(doc):
    if not doc:
        return doc
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    
    for key, value in doc.items():
        if isinstance(value, dict):
            serialize_doc(value)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    serialize_doc(item)
    return doc

@router.get("/count")
async def get_alerts_count():
    try:
        # Assuming status "pending" or just counting available alerts
        # For now, let's count alerts where slack_sent is false or just all alerts
        count = await db.alerts.count_documents({"slack_sent": False})
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_alerts():
    try:
        # Join alerts with gazettes on gazette_id
        # Filter for slack_sent=False to show only new alerts
        pipeline = [
            {
                "$match": {"slack_sent": False}
            },
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
            },
            {"$sort": {"alerted_at": -1}}
        ]
        
        cursor = db.alerts.aggregate(pipeline)
        alerts = await cursor.to_list(length=100)
        
        return [serialize_doc(a) for a in alerts]
    except Exception as e:
        print(f"Error in get_alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/processed")
async def get_processed_alerts(
    query: Optional[str] = None,
    tags: Optional[str] = None, # legislative_value,economic_impact,political_relevance
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    sortBy: str = "newest"
):
    try:
        # Build base match for processed alerts
        match_stage = {"slack_sent": True}
        
        # Tags filter (multiple options)
        if tags:
            tag_list = tags.split(",")
            for tag in tag_list:
                if tag.strip() in ["legislative_value", "economic_impact", "political_relevance"]:
                    match_stage[tag.strip()] = True

        pipeline = [
            {"$match": match_stage},
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

        # Search filter (across alert and gazette fields)
        if query:
            regex_query = {"$regex": query, "$options": "i"}
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

        # Sorting
        sort_order = -1 if sortBy == "newest" else 1
        pipeline.append({"$sort": {"alerted_at": sort_order}})
        
        cursor = db.alerts.aggregate(pipeline)
        alerts = await cursor.to_list(length=100)
        
        return [serialize_doc(a) for a in alerts]
    except Exception as e:
        print(f"Error in get_processed_alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{alert_id}")
async def get_alert_detail(alert_id: str):
    try:
        alert = None
        gazette = None

        # ── Try to find by alert _id (ObjectId) ──────────────────────────────
        try:
            alert = await db.alerts.find_one({"_id": ObjectId(alert_id)})
        except Exception:
            pass

        if not alert:
            # Try by string id field (legacy)
            alert = await db.alerts.find_one({"id": alert_id})

        if alert:
            # Found an alert — fetch its linked gazette
            gazette = await db.gazettes.find_one({"gazette_id": alert.get("gazette_id")})
            return {
                "alert": serialize_doc(alert),
                "gazette": serialize_doc(gazette) if gazette else None
            }

        # ── Fallback: treat alert_id as a gazette _id ────────────────────────
        # This handles synthetic gazette results from the unified search that
        # don't have a corresponding alert document.
        try:
            gazette = await db.gazettes.find_one({"_id": ObjectId(alert_id)})
        except Exception:
            pass

        if not gazette:
            raise HTTPException(status_code=404, detail="Alert or gazette not found")

        # Build a minimal synthetic alert so the detail page renders correctly
        synthetic_alert = {
            "_id": gazette["_id"],
            "gazette_id": gazette.get("gazette_id"),
            "summary": gazette.get("subject", ""),
            "reason": "",
            "priority": "low",
            "slack_sent": None,
            "is_relevant": None,
            "legislative_value": False,
            "economic_impact": False,
            "political_relevance": False,
            "alerted_at": None,
            "updated_at": None,
        }

        return {
            "alert": serialize_doc(synthetic_alert),
            "gazette": serialize_doc(gazette)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{alert_id}/action")
async def take_action(alert_id: str, action: str = Body(..., embed=True)):
    # action: "approve" or "decline"
    try:
        is_relevant = True if action == "approve" else False
        # User requested slack_sent to be null (None) when declined
        slack_sent_val = True if action == "approve" else None
        
        result = await db.alerts.update_one(
            {"_id": ObjectId(alert_id)},
            {"$set": {"is_relevant": is_relevant, "slack_sent": slack_sent_val, "updated_at": datetime.utcnow()}}
        )
        
        if result.modified_count == 0:
             raise HTTPException(status_code=404, detail="Alert not updated")
             
        return {"status": "success", "action": action}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
