import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(name, url):
    print(f"Testing {name} ({url})...", end=" ")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("OK")
            return True
        else:
            print(f"FAILED (Status: {response.status_code})")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def main():
    print("Verifying FastAPI Endpoints...")
    
    success = True
    success &= test_endpoint("Root", f"{BASE_URL}/")
    success &= test_endpoint("All Summary", f"{BASE_URL}/all")
    success &= test_endpoint("Livelaw List", f"{BASE_URL}/livelaw?limit=5")
    success &= test_endpoint("ICHR List", f"{BASE_URL}/ichr?limit=5")
    success &= test_endpoint("Global Search", f"{BASE_URL}/search?query=court")
    
    if success:
        print("\nAll basic endpoint tests passed!")
    else:
        print("\nSome tests failed. Make sure the FastAPI server is running.")

if __name__ == "__main__":
    main()
