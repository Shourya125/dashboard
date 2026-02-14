# Gazette Search Implementation Plan

## Current Issue
The `/search` endpoint returns 500 Internal Server Error when `site=gazette` is specified.

## Root Cause Analysis

### Data Structure
From `/alerts/processed`:
- Returns documents with `gazette_details` nested object
- Has `_id` field at root level (from alerts collection)
- `gazette_details` contains: ministry, subject, publish_date (DD/MM/YYYY format), pdf_text, etc.

### Code Issues Identified
1. ✅ **Date Format**: Fixed - Changed from ISO format to DD/MM/YYYY using `strptime`
2. ✅ **Date Filtering**: Fixed - Using `$dateFromString` with `%d/%m/%Y` format
3. ❓ **Serialization**: Need to verify - `serialize_doc` expects `_id` field

## Implementation Steps

### Step 1: Test Basic Aggregation
Test if the aggregation pipeline works without search/filter:
```python
pipeline = [
    {"$match": {"slack_sent": True}},
    {"$lookup": {...}},
    {"$unwind": "$gazette_details"},
    {"$limit": 1}
]
```

### Step 2: Verify Serialization
Check if `serialize_doc` can handle the aggregation result structure

### Step 3: Add Search Logic
Once basic retrieval works, add the regex search

### Step 4: Add Date Filtering
Add the date range filtering with proper format handling

## Testing Plan
1. Test `/search?site=gazette` (no query, no filters)
2. Test `/search?site=gazette&query=Finance`
3. Test `/search?site=gazette&startDate=2026-02-01&endDate=2026-02-15`
4. Test `/search?query=ministry` (all sources)
