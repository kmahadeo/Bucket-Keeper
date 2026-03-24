#!/usr/bin/env python3
"""
Additional API Tests for Bucket Keeper - Archive, Delete, and Edge Cases
"""

import requests
import json
import uuid

BASE_URL = "https://bucket-preview.preview.emergentagent.com/api"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "test123"

def test_additional_apis():
    session = requests.Session()
    
    # Login first
    login_data = {"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
    login_response = session.post(f"{BASE_URL}/auth/login", json=login_data)
    
    if login_response.status_code != 200:
        print("❌ Failed to login for additional tests")
        return
    
    # Extract session token
    user_token = None
    if 'Set-Cookie' in login_response.headers:
        cookie_header = login_response.headers['Set-Cookie']
        if 'session_token=' in cookie_header:
            user_token = cookie_header.split('session_token=')[1].split(';')[0]
    
    if not user_token:
        print("❌ No authentication token found")
        return
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    print("🔍 Testing Additional APIs")
    print("=" * 40)
    
    # Test 1: Create an item to test archive/delete
    item_data = {
        "title": "Test item for archive/delete",
        "bucket_type": "personal",
        "item_type": "task",
        "reward": 15,
        "assignee": "me",
        "priority": "low"
    }
    
    create_response = session.post(f"{BASE_URL}/items", json=item_data, headers=headers)
    if create_response.status_code in [200, 201]:
        item_id = create_response.json().get("item_id")
        print(f"✅ Created test item: {item_id}")
        
        # Test 2: Archive item
        archive_response = session.put(f"{BASE_URL}/items/{item_id}/archive", headers=headers)
        if archive_response.status_code == 200:
            print("✅ Archive Item API - Working")
        else:
            print(f"❌ Archive Item API - Failed: {archive_response.status_code}")
        
        # Test 3: Delete item
        delete_response = session.delete(f"{BASE_URL}/items/{item_id}", headers=headers)
        if delete_response.status_code == 200:
            print("✅ Delete Item API - Working")
        else:
            print(f"❌ Delete Item API - Failed: {delete_response.status_code}")
    else:
        print("❌ Failed to create test item for archive/delete tests")
    
    # Test 4: Get items with filters
    filters = [
        ("completed=true", "Completed items filter"),
        ("bucket_type=personal", "Personal bucket filter"),
        ("bucket_type=joint", "Joint bucket filter"),
        ("archived=true", "Archived items filter")
    ]
    
    for filter_param, description in filters:
        filter_response = session.get(f"{BASE_URL}/items?{filter_param}", headers=headers)
        if filter_response.status_code == 200:
            items = filter_response.json()
            print(f"✅ {description} - Retrieved {len(items)} items")
        else:
            print(f"❌ {description} - Failed: {filter_response.status_code}")
    
    # Test 5: Get partner info
    partner_response = session.get(f"{BASE_URL}/user/partner", headers=headers)
    if partner_response.status_code == 200:
        partner_data = partner_response.json()
        if partner_data:
            print(f"✅ Get Partner API - Partner found: {partner_data.get('name', 'Unknown')}")
        else:
            print("✅ Get Partner API - No partner linked (expected)")
    else:
        print(f"❌ Get Partner API - Failed: {partner_response.status_code}")
    
    # Test 6: Get priorities
    priorities_response = session.get(f"{BASE_URL}/stats/priorities", headers=headers)
    if priorities_response.status_code == 200:
        priorities = priorities_response.json()
        print(f"✅ Get Priorities API - Retrieved {len(priorities)} high priority items")
    else:
        print(f"❌ Get Priorities API - Failed: {priorities_response.status_code}")
    
    # Test 7: AI Daily Plan
    daily_plan_response = session.post(f"{BASE_URL}/ai/daily-plan", headers=headers)
    if daily_plan_response.status_code == 200:
        plan = daily_plan_response.json()
        print(f"✅ AI Daily Plan API - Generated plan with {len(plan.get('plan', []))} items")
    else:
        print(f"❌ AI Daily Plan API - Failed: {daily_plan_response.status_code}")
    
    # Test 8: Logout
    logout_response = session.post(f"{BASE_URL}/auth/logout", headers=headers)
    if logout_response.status_code == 200:
        print("✅ Logout API - Working")
    else:
        print(f"❌ Logout API - Failed: {logout_response.status_code}")
    
    print("\n🏁 Additional API tests completed!")

if __name__ == "__main__":
    test_additional_apis()