#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Bucket Keeper
Tests all authentication, CRUD operations, rewards, and AI features
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration
BASE_URL = "https://bucket-preview.preview.emergentagent.com/api"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "test123"
TEST_USER_NAME = "Test User"

# Test data
TEST_PARTNER_EMAIL = "partner@example.com"
TEST_PARTNER_PASSWORD = "partner123"
TEST_PARTNER_NAME = "Test Partner"

class BucketKeeperAPITest:
    def __init__(self):
        self.session = requests.Session()
        self.user_token = None
        self.partner_token = None
        self.user_data = None
        self.partner_data = None
        self.test_item_id = None
        self.test_reward_id = None
        self.results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details or {}
        }
        self.results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, headers=None, token=None):
        """Make HTTP request with proper error handling"""
        url = f"{BASE_URL}{endpoint}"
        
        # Set up headers
        req_headers = {"Content-Type": "application/json"}
        if headers:
            req_headers.update(headers)
        if token:
            req_headers["Authorization"] = f"Bearer {token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=req_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=req_headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=req_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=req_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            return None, str(e)
    
    def test_user_registration(self):
        """Test user registration API"""
        print("\n=== Testing User Registration ===")
        
        # Use unique email for testing
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        user_data = {
            "email": unique_email,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME
        }
        
        response = self.make_request("POST", "/auth/register", user_data)
        
        if response is None:
            self.log_result("User Registration", False, "Request failed - connection error")
            return False
            
        if response.status_code == 201 or response.status_code == 200:
            try:
                data = response.json()
                if "user_id" in data and "email" in data and "partner_code" in data:
                    self.user_data = data
                    self.log_result("User Registration", True, f"User created successfully with ID: {data['user_id']}")
                    return True
                else:
                    self.log_result("User Registration", False, "Missing required fields in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("User Registration", False, "Invalid JSON response", {"status_code": response.status_code})
                return False
        else:
            try:
                error_data = response.json()
                # If user already exists, try to login instead for testing continuity
                if response.status_code == 400 and "already registered" in error_data.get('detail', ''):
                    self.log_result("User Registration", True, "User already exists - will use existing user for testing")
                    return True
                else:
                    self.log_result("User Registration", False, f"Registration failed: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("User Registration", False, f"Registration failed with status {response.status_code}")
            return False
    
    def test_user_login(self):
        """Test user login API"""
        print("\n=== Testing User Login ===")
        
        login_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response is None:
            self.log_result("User Login", False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if "user_id" in data:
                    # Check for session token in cookies or response
                    session_token = None
                    if 'Set-Cookie' in response.headers:
                        # Extract session token from cookie
                        cookie_header = response.headers['Set-Cookie']
                        if 'session_token=' in cookie_header:
                            session_token = cookie_header.split('session_token=')[1].split(';')[0]
                    
                    self.user_token = session_token
                    self.user_data = data
                    self.log_result("User Login", True, f"Login successful for user: {data['email']}")
                    return True
                else:
                    self.log_result("User Login", False, "Missing user_id in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("User Login", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                self.log_result("User Login", False, f"Login failed: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("User Login", False, f"Login failed with status {response.status_code}")
            return False
    
    def test_get_current_user(self):
        """Test get current user API"""
        print("\n=== Testing Get Current User ===")
        
        if not self.user_token:
            self.log_result("Get Current User", False, "No authentication token available")
            return False
            
        response = self.make_request("GET", "/auth/me", token=self.user_token)
        
        if response is None:
            self.log_result("Get Current User", False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if "user_id" in data and "email" in data:
                    self.log_result("Get Current User", True, f"Retrieved user data for: {data['email']}")
                    return True
                else:
                    self.log_result("Get Current User", False, "Missing required fields in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("Get Current User", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                self.log_result("Get Current User", False, f"Failed to get user: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("Get Current User", False, f"Failed with status {response.status_code}")
            return False
    
    def test_create_bucket_item(self):
        """Test create bucket item API"""
        print("\n=== Testing Create Bucket Item ===")
        
        if not self.user_token:
            self.log_result("Create Bucket Item", False, "No authentication token available")
            return False
            
        item_data = {
            "title": "Complete project documentation",
            "bucket_type": "personal",
            "item_type": "task",
            "reward": 25,
            "assignee": "me",
            "priority": "high",
            "frequency": "once",
            "description": "Write comprehensive documentation for the project"
        }
        
        response = self.make_request("POST", "/items", item_data, token=self.user_token)
        
        if response is None:
            self.log_result("Create Bucket Item", False, "Request failed - connection error")
            return False
            
        if response.status_code == 200 or response.status_code == 201:
            try:
                data = response.json()
                if "item_id" in data and "title" in data:
                    self.test_item_id = data["item_id"]
                    self.log_result("Create Bucket Item", True, f"Item created successfully: {data['title']}")
                    return True
                else:
                    self.log_result("Create Bucket Item", False, "Missing required fields in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("Create Bucket Item", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                self.log_result("Create Bucket Item", False, f"Failed to create item: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("Create Bucket Item", False, f"Failed with status {response.status_code}")
            return False
    
    def test_get_bucket_items(self):
        """Test get bucket items API"""
        print("\n=== Testing Get Bucket Items ===")
        
        if not self.user_token:
            self.log_result("Get Bucket Items", False, "No authentication token available")
            return False
            
        response = self.make_request("GET", "/items", token=self.user_token)
        
        if response is None:
            self.log_result("Get Bucket Items", False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Bucket Items", True, f"Retrieved {len(data)} items")
                    return True
                else:
                    self.log_result("Get Bucket Items", False, "Response is not a list", {"type": type(data).__name__})
                    return False
            except json.JSONDecodeError:
                self.log_result("Get Bucket Items", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                self.log_result("Get Bucket Items", False, f"Failed to get items: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("Get Bucket Items", False, f"Failed with status {response.status_code}")
            return False
    
    def test_complete_item(self):
        """Test complete item API"""
        print("\n=== Testing Complete Item ===")
        
        if not self.user_token:
            self.log_result("Complete Item", False, "No authentication token available")
            return False
            
        if not self.test_item_id:
            self.log_result("Complete Item", False, "No test item available to complete")
            return False
            
        response = self.make_request("PUT", f"/items/{self.test_item_id}/complete", token=self.user_token)
        
        if response is None:
            self.log_result("Complete Item", False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if "message" in data and "coins_earned" in data:
                    self.log_result("Complete Item", True, f"Item completed! Earned {data['coins_earned']} coins")
                    return True
                else:
                    self.log_result("Complete Item", False, "Missing required fields in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("Complete Item", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                self.log_result("Complete Item", False, f"Failed to complete item: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("Complete Item", False, f"Failed with status {response.status_code}")
            return False
    
    def test_create_reward(self):
        """Test create reward API"""
        print("\n=== Testing Create Reward ===")
        
        if not self.user_token:
            self.log_result("Create Reward", False, "No authentication token available")
            return False
            
        # Create a reward with lower cost to ensure it can be redeemed
        reward_data = {
            "title": "Coffee break",
            "cost": 20,  # Lower cost to ensure redemption works
            "reward_type": "personal",  # Use personal coins which should have enough
            "icon": "☕",
            "is_goal": False
        }
        
        response = self.make_request("POST", "/rewards", reward_data, token=self.user_token)
        
        if response is None:
            self.log_result("Create Reward", False, "Request failed - connection error")
            return False
            
        if response.status_code == 200 or response.status_code == 201:
            try:
                data = response.json()
                if "reward_id" in data and "title" in data:
                    self.test_reward_id = data["reward_id"]
                    self.log_result("Create Reward", True, f"Reward created successfully: {data['title']}")
                    return True
                else:
                    self.log_result("Create Reward", False, "Missing required fields in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("Create Reward", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                self.log_result("Create Reward", False, f"Failed to create reward: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("Create Reward", False, f"Failed with status {response.status_code}")
            return False
    
    def test_get_rewards(self):
        """Test get rewards API"""
        print("\n=== Testing Get Rewards ===")
        
        if not self.user_token:
            self.log_result("Get Rewards", False, "No authentication token available")
            return False
            
        response = self.make_request("GET", "/rewards", token=self.user_token)
        
        if response is None:
            self.log_result("Get Rewards", False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Rewards", True, f"Retrieved {len(data)} rewards")
                    return True
                else:
                    self.log_result("Get Rewards", False, "Response is not a list", {"type": type(data).__name__})
                    return False
            except json.JSONDecodeError:
                self.log_result("Get Rewards", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                self.log_result("Get Rewards", False, f"Failed to get rewards: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("Get Rewards", False, f"Failed with status {response.status_code}")
            return False
    
    def test_redeem_reward(self):
        """Test redeem reward API"""
        print("\n=== Testing Redeem Reward ===")
        
        if not self.user_token:
            self.log_result("Redeem Reward", False, "No authentication token available")
            return False
            
        if not self.test_reward_id:
            self.log_result("Redeem Reward", False, "No test reward available to redeem")
            return False
            
        response = self.make_request("POST", f"/rewards/{self.test_reward_id}/redeem", token=self.user_token)
        
        if response is None:
            self.log_result("Redeem Reward", False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if "message" in data and "coins_spent" in data:
                    self.log_result("Redeem Reward", True, f"Reward redeemed! Spent {data['coins_spent']} coins")
                    return True
                else:
                    self.log_result("Redeem Reward", False, "Missing required fields in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("Redeem Reward", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                self.log_result("Redeem Reward", False, f"Failed to redeem reward: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("Redeem Reward", False, f"Failed with status {response.status_code}")
            return False
    
    def test_update_mood(self):
        """Test update mood API"""
        print("\n=== Testing Update Mood ===")
        
        if not self.user_token:
            self.log_result("Update Mood", False, "No authentication token available")
            return False
            
        mood_data = {
            "mood": "excited",
            "mood_emoji": "🎉"
        }
        
        response = self.make_request("PUT", "/user/mood", mood_data, token=self.user_token)
        
        if response is None:
            self.log_result("Update Mood", False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if "message" in data and "mood" in data:
                    self.log_result("Update Mood", True, f"Mood updated to: {data['mood']} {data['mood_emoji']}")
                    return True
                else:
                    self.log_result("Update Mood", False, "Missing required fields in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("Update Mood", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                self.log_result("Update Mood", False, f"Failed to update mood: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("Update Mood", False, f"Failed with status {response.status_code}")
            return False
    
    def test_partner_linking(self):
        """Test partner linking functionality"""
        print("\n=== Testing Partner Linking ===")
        
        # Create a separate session for partner user to avoid session conflicts
        partner_session = requests.Session()
        
        # First create a partner user with unique email
        unique_partner_email = f"partner_{uuid.uuid4().hex[:8]}@example.com"
        partner_data = {
            "email": unique_partner_email,
            "password": TEST_PARTNER_PASSWORD,
            "name": TEST_PARTNER_NAME
        }
        
        response = partner_session.post(f"{BASE_URL}/auth/register", json=partner_data)
        
        if response is None or response.status_code not in [200, 201]:
            self.log_result("Partner Linking", False, "Failed to create partner user for testing")
            return False
            
        try:
            partner_user_data = response.json()
            partner_code = partner_user_data.get("partner_code")
            
            if not partner_code:
                self.log_result("Partner Linking", False, "Partner code not found in registration response")
                return False
                
            # Now test linking using the main user's session
            link_data = {"partner_code": partner_code}
            
            response = self.make_request("POST", "/user/link-partner", link_data, token=self.user_token)
            
            if response is None:
                self.log_result("Partner Linking", False, "Request failed - connection error")
                return False
                
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "message" in data and "partner_name" in data:
                        self.log_result("Partner Linking", True, f"Successfully linked to partner: {data['partner_name']}")
                        return True
                    else:
                        self.log_result("Partner Linking", False, "Missing required fields in response", data)
                        return False
                except json.JSONDecodeError:
                    self.log_result("Partner Linking", False, "Invalid JSON response")
                    return False
            else:
                try:
                    error_data = response.json()
                    self.log_result("Partner Linking", False, f"Failed to link partner: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
                except:
                    self.log_result("Partner Linking", False, f"Failed with status {response.status_code}")
                return False
                
        except json.JSONDecodeError:
            self.log_result("Partner Linking", False, "Invalid JSON response from partner registration")
            return False
    
    def test_ai_insight(self):
        """Test AI insight API"""
        print("\n=== Testing AI Insight ===")
        
        if not self.user_token:
            self.log_result("AI Insight", False, "No authentication token available")
            return False
            
        insight_data = {"context": "home"}
        
        response = self.make_request("POST", "/ai/insight", insight_data, token=self.user_token)
        
        if response is None:
            self.log_result("AI Insight", False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if "insight" in data:
                    self.log_result("AI Insight", True, f"AI insight received: {data['insight'][:50]}...")
                    return True
                else:
                    self.log_result("AI Insight", False, "Missing insight field in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("AI Insight", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                self.log_result("AI Insight", False, f"Failed to get AI insight: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("AI Insight", False, f"Failed with status {response.status_code}")
            return False
    
    def test_stats_snapshot(self):
        """Test stats snapshot API"""
        print("\n=== Testing Stats Snapshot ===")
        
        if not self.user_token:
            self.log_result("Stats Snapshot", False, "No authentication token available")
            return False
            
        response = self.make_request("GET", "/stats/snapshot", token=self.user_token)
        
        if response is None:
            self.log_result("Stats Snapshot", False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if "me" in data and "us" in data:
                    self.log_result("Stats Snapshot", True, f"Stats snapshot retrieved successfully")
                    return True
                else:
                    self.log_result("Stats Snapshot", False, "Missing required fields in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("Stats Snapshot", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                self.log_result("Stats Snapshot", False, f"Failed to get stats: {error_data.get('detail', 'Unknown error')}", {"status_code": response.status_code})
            except:
                self.log_result("Stats Snapshot", False, f"Failed with status {response.status_code}")
            return False
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print(f"🚀 Starting Bucket Keeper API Tests")
        print(f"Base URL: {BASE_URL}")
        print("=" * 60)
        
        # Authentication flow tests
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        
        # Bucket items CRUD tests
        self.test_create_bucket_item()
        self.test_get_bucket_items()
        self.test_complete_item()
        
        # Rewards system tests
        self.test_create_reward()
        self.test_get_rewards()
        self.test_redeem_reward()
        
        # User features tests
        self.test_update_mood()
        self.test_partner_linking()
        
        # AI and stats tests
        self.test_ai_insight()
        self.test_stats_snapshot()
        
        # Print summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if "✅ PASS" in r["status"])
        failed = sum(1 for r in self.results if "❌ FAIL" in r["status"])
        
        print(f"Total Tests: {len(self.results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if "❌ FAIL" in result["status"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.results:
            if "✅ PASS" in result["status"]:
                print(f"  - {result['test']}: {result['message']}")
        
        return passed, failed

if __name__ == "__main__":
    tester = BucketKeeperAPITest()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)