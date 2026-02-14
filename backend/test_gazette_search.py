#!/usr/bin/env python3
"""Test script to verify Gazette search functionality"""
import requests
import json

API_URL = "http://localhost:8000"

def test_search(query="", site="", sortBy=""):
    """Test the /search endpoint"""
    params = {}
    if query: params["query"] = query
    if site: params["site"] = site
    if sortBy: params["sortBy"] = sortBy
    
    print(f"\n{'='*60}")
    print(f"Testing: query='{query}', site='{site}', sortBy='{sortBy}'")
    print(f"{'='*60}")
    
    try:
        response = requests.get(f"{API_URL}/search", params=params)
        data = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Counts: {data.get('counts', {})}")
        print(f"Total Results: {len(data.get('results', []))}")
        
        if data.get('results'):
            print(f"\nFirst result type: {data['results'][0].get('_type')}")
            if data['results'][0].get('_type') == 'gazette':
                print(f"Gazette ID: {data['results'][0].get('gazette_id')}")
                print(f"Summary: {data['results'][0].get('summary', '')[:100]}...")
        
        return data
    except Exception as e:
        print(f"ERROR: {e}")
        return None

if __name__ == "__main__":
    # Test 1: Search all sources
    print("\n" + "="*60)
    print("TEST 1: Search all sources for 'ministry'")
    test_search(query="ministry")
    
    # Test 2: Search only gazettes
    print("\n" + "="*60)
    print("TEST 2: Search only gazettes for 'ministry'")
    test_search(query="ministry", site="gazette")
    
    # Test 3: Search gazettes for 'Finance'
    print("\n" + "="*60)
    print("TEST 3: Search gazettes for 'Finance'")
    test_search(query="Finance", site="gazette")
    
    # Test 4: Get all gazettes (no query)
    print("\n" + "="*60)
    print("TEST 4: Get all gazettes (no query filter)")
    test_search(site="gazette")
