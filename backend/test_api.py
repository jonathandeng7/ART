#!/usr/bin/env python3
"""
Test script for the Art Beyond Sight API
Run this to test your API endpoints
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_api():
    print("🧪 Testing Art Beyond Sight API...")
    
    # Test health check
    print("\n1. Testing health check...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test creating an image analysis
    print("\n2. Testing image analysis creation...")
    test_data = {
        "image_name": "test_artwork.jpg",
        "analysis_type": "museum",
        "descriptions": [
            "A beautiful abstract painting with vibrant colors",
            "The artwork features geometric shapes and bold brushstrokes",
            "Created using oil on canvas technique"
        ],
        "metadata": {
            "artist": "Test Artist",
            "year": "2024",
            "location": "Test Museum",
            "tags": ["abstract", "colorful", "modern"]
        }
    }
    
    response = requests.post(f"{BASE_URL}/api/image-analysis", json=test_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        created_analysis = response.json()
        print(f"Created analysis ID: {created_analysis['id']}")
        
        # Test retrieving the analysis
        print("\n3. Testing analysis retrieval...")
        response = requests.get(f"{BASE_URL}/api/image-analysis/{created_analysis['id']}")
        print(f"Status: {response.status_code}")
        print(f"Retrieved: {response.json()['image_name']}")
        
        # Test getting all analyses
        print("\n4. Testing get all analyses...")
        response = requests.get(f"{BASE_URL}/api/image-analysis")
        print(f"Status: {response.status_code}")
        analyses = response.json()
        print(f"Found {len(analyses)} analyses")
        
        # Test search by name
        print("\n5. Testing search by name...")
        response = requests.get(f"{BASE_URL}/api/image-analysis/search/test_artwork")
        print(f"Status: {response.status_code}")
        results = response.json()
        print(f"Search results: {len(results)} found")
        
    else:
        print(f"Failed to create analysis: {response.text}")

if __name__ == "__main__":
    try:
        test_api()
        print("\n✅ All tests completed!")
    except requests.exceptions.ConnectionError:
        print("❌ connect to the API. Make sure the server is running with: python main.py")
    except Exception as e:
        print(f"❌ Test failed: {e}")