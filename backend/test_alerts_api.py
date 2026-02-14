import http.client
import json

def test_alerts():
    conn = http.client.HTTPConnection("localhost", 8000)
    
    # 1. Test count
    conn.request("GET", "/alerts/count")
    res = conn.getresponse()
    print(f"Count Response: {res.status}")
    print(res.read().decode())
    
    # 2. Test list
    conn.request("GET", "/alerts/")
    res = conn.getresponse()
    print(f"List Response: {res.status}")
    alerts = json.loads(res.read().decode())
    print(f"Fetched {len(alerts)} alerts")
    
    if len(alerts) > 0:
        alert_id = alerts[0]['id']
        # 3. Test detail
        conn.request("GET", f"/alerts/{alert_id}")
        res = conn.getresponse()
        print(f"Detail Response: {res.status}")
        print(res.read().decode()[:500] + "...")
        
    conn.close()

if __name__ == "__main__":
    test_alerts()
