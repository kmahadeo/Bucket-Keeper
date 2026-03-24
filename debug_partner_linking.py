#!/usr/bin/env python3
"""
Debug Partner Linking Issue
"""

import requests
import json
import uuid

BASE_URL = "https://bucket-preview.preview.emergentagent.com/api"

def test_partner_linking_debug():
    session = requests.Session()
    
    # Create first user
    user1_email = f"user1_{uuid.uuid4().hex[:8]}@example.com"
    user1_data = {
        "email": user1_email,
        "password": "test123",
        "name": "User One"
    }
    
    print(f"Creating user 1: {user1_email}")
    response1 = session.post(f"{BASE_URL}/auth/register", json=user1_data)
    print(f"User 1 registration status: {response1.status_code}")
    
    if response1.status_code not in [200, 201]:
        print(f"Failed to create user 1: {response1.text}")
        return
        
    user1_response = response1.json()
    print(f"User 1 created: {user1_response}")
    
    # Login user 1
    login1_data = {"email": user1_email, "password": "test123"}
    login1_response = session.post(f"{BASE_URL}/auth/login", json=login1_data)
    print(f"User 1 login status: {login1_response.status_code}")
    
    if login1_response.status_code != 200:
        print(f"Failed to login user 1: {login1_response.text}")
        return
        
    # Extract session token from cookies
    user1_token = None
    if 'Set-Cookie' in login1_response.headers:
        cookie_header = login1_response.headers['Set-Cookie']
        if 'session_token=' in cookie_header:
            user1_token = cookie_header.split('session_token=')[1].split(';')[0]
    
    print(f"User 1 token: {user1_token[:20]}..." if user1_token else "No token found")
    
    # Create second user
    user2_email = f"user2_{uuid.uuid4().hex[:8]}@example.com"
    user2_data = {
        "email": user2_email,
        "password": "test123",
        "name": "User Two"
    }
    
    print(f"\nCreating user 2: {user2_email}")
    response2 = session.post(f"{BASE_URL}/auth/register", json=user2_data)
    print(f"User 2 registration status: {response2.status_code}")
    
    if response2.status_code not in [200, 201]:
        print(f"Failed to create user 2: {response2.text}")
        return
        
    user2_response = response2.json()
    print(f"User 2 created: {user2_response}")
    user2_partner_code = user2_response.get("partner_code")
    
    # Now try to link user 1 to user 2
    print(f"\nTrying to link user 1 to user 2 using code: {user2_partner_code}")
    
    link_data = {"partner_code": user2_partner_code}
    headers = {"Authorization": f"Bearer {user1_token}"} if user1_token else {}
    
    link_response = session.post(f"{BASE_URL}/user/link-partner", json=link_data, headers=headers)
    print(f"Link response status: {link_response.status_code}")
    print(f"Link response: {link_response.text}")

if __name__ == "__main__":
    test_partner_linking_debug()