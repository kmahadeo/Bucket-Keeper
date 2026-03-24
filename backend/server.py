from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'bucket-keeper-secret-key-2024-v1')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="Bucket Keeper API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    coins_joint: int = 0
    coins_personal: int = 0
    mood: Optional[str] = None
    mood_emoji: Optional[str] = None
    partner_id: Optional[str] = None
    partner_code: Optional[str] = None
    created_at: datetime

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    coins_joint: int = 0
    coins_personal: int = 0
    mood: Optional[str] = None
    mood_emoji: Optional[str] = None
    partner_id: Optional[str] = None
    partner_code: Optional[str] = None
    partner_name: Optional[str] = None

class BucketItemCreate(BaseModel):
    title: str
    bucket_type: str = "joint"  # joint, personal
    item_type: str = "task"  # task, goal, habit
    reward: int = 10
    assignee: str = "anyone"  # me, partner, anyone
    priority: str = "medium"  # low, medium, high
    frequency: str = "once"  # once, daily, weekly, monthly
    due_date: Optional[datetime] = None
    description: Optional[str] = None

class BucketItem(BaseModel):
    item_id: str
    user_id: str
    title: str
    bucket_type: str
    item_type: str
    reward: int
    assignee: str
    priority: str
    frequency: str
    due_date: Optional[datetime] = None
    description: Optional[str] = None
    completed: bool = False
    completed_by: Optional[str] = None
    completed_at: Optional[datetime] = None
    archived: bool = False
    created_at: datetime

class RewardCreate(BaseModel):
    title: str
    cost: int
    reward_type: str = "personal"  # personal, joint
    icon: Optional[str] = None
    is_goal: bool = False

class Reward(BaseModel):
    reward_id: str
    user_id: str
    title: str
    cost: int
    reward_type: str
    icon: Optional[str] = None
    is_goal: bool = False
    redeemed: bool = False
    redeemed_at: Optional[datetime] = None
    created_at: datetime

class MoodUpdate(BaseModel):
    mood: str
    mood_emoji: str

class PartnerLink(BaseModel):
    partner_code: str

class AIInsightRequest(BaseModel):
    context: str = "home"

# ============ AUTH HELPERS ============

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

async def get_current_user(request: Request) -> dict:
    """Get current user from cookie or Authorization header"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check session in database
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Session not found")
    
    # Check expiry
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user_doc

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    """Register a new user with email/password"""
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    partner_code = uuid.uuid4().hex[:6].upper()
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": get_password_hash(user_data.password),
        "picture": None,
        "coins_joint": 100,  # Starting bonus
        "coins_personal": 50,
        "mood": "happy",
        "mood_emoji": "😊",
        "partner_id": None,
        "partner_code": partner_code,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_doc)
    
    # Create session
    session_token = create_access_token({"user_id": user_id})
    expires_at = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "coins_joint": 100,
        "coins_personal": 50,
        "partner_code": partner_code
    }

@api_router.post("/auth/login")
async def login(user_data: UserLogin, response: Response):
    """Login with email/password"""
    user_doc = await db.users.find_one({"email": user_data.email})
    
    if not user_doc or not verify_password(user_data.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    session_token = create_access_token({"user_id": user_doc["user_id"]})
    expires_at = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    
    await db.user_sessions.insert_one({
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    return {
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "name": user_doc["name"],
        "picture": user_doc.get("picture"),
        "coins_joint": user_doc.get("coins_joint", 0),
        "coins_personal": user_doc.get("coins_personal", 0),
        "mood": user_doc.get("mood"),
        "mood_emoji": user_doc.get("mood_emoji"),
        "partner_id": user_doc.get("partner_id"),
        "partner_code": user_doc.get("partner_code")
    }

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Process OAuth session from Emergent Auth"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Get user data from Emergent Auth
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
    
    if auth_response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    auth_data = auth_response.json()
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Check if user exists
    user_doc = await db.users.find_one({"email": email})
    
    if user_doc:
        # Update existing user
        user_id = user_doc["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        partner_code = uuid.uuid4().hex[:6].upper()
        
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "coins_joint": 100,
            "coins_personal": 50,
            "mood": "happy",
            "mood_emoji": "😊",
            "partner_id": None,
            "partner_code": partner_code,
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    expires_at = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    # Get updated user
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    return user_doc

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user"""
    # Get partner info if linked
    partner_name = None
    if current_user.get("partner_id"):
        partner = await db.users.find_one(
            {"user_id": current_user["partner_id"]},
            {"_id": 0, "name": 1}
        )
        if partner:
            partner_name = partner.get("name")
    
    return {
        **current_user,
        "partner_name": partner_name
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ============ USER ENDPOINTS ============

@api_router.put("/user/mood")
async def update_mood(mood_data: MoodUpdate, current_user: dict = Depends(get_current_user)):
    """Update user's mood"""
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"mood": mood_data.mood, "mood_emoji": mood_data.mood_emoji}}
    )
    return {"message": "Mood updated", "mood": mood_data.mood, "mood_emoji": mood_data.mood_emoji}

@api_router.post("/user/link-partner")
async def link_partner(link_data: PartnerLink, current_user: dict = Depends(get_current_user)):
    """Link with partner using their code"""
    if current_user.get("partner_id"):
        raise HTTPException(status_code=400, detail="Already linked to a partner")
    
    # Find partner by code
    partner = await db.users.find_one(
        {"partner_code": link_data.partner_code.upper()},
        {"_id": 0}
    )
    
    if not partner:
        raise HTTPException(status_code=404, detail="Partner code not found")
    
    if partner["user_id"] == current_user["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot link to yourself")
    
    if partner.get("partner_id"):
        raise HTTPException(status_code=400, detail="Partner is already linked to someone")
    
    # Link both users
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"partner_id": partner["user_id"]}}
    )
    await db.users.update_one(
        {"user_id": partner["user_id"]},
        {"$set": {"partner_id": current_user["user_id"]}}
    )
    
    return {"message": "Partner linked successfully", "partner_name": partner["name"]}

@api_router.get("/user/partner")
async def get_partner(current_user: dict = Depends(get_current_user)):
    """Get partner's info"""
    if not current_user.get("partner_id"):
        return None
    
    partner = await db.users.find_one(
        {"user_id": current_user["partner_id"]},
        {"_id": 0, "password_hash": 0}
    )
    
    return partner

# ============ BUCKET ITEMS ENDPOINTS ============

@api_router.post("/items")
async def create_item(item_data: BucketItemCreate, current_user: dict = Depends(get_current_user)):
    """Create a new bucket item"""
    item_id = f"item_{uuid.uuid4().hex[:12]}"
    
    item_doc = {
        "item_id": item_id,
        "user_id": current_user["user_id"],
        "title": item_data.title,
        "bucket_type": item_data.bucket_type,
        "item_type": item_data.item_type,
        "reward": item_data.reward,
        "assignee": item_data.assignee,
        "priority": item_data.priority,
        "frequency": item_data.frequency,
        "due_date": item_data.due_date,
        "description": item_data.description,
        "completed": False,
        "completed_by": None,
        "completed_at": None,
        "archived": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.bucket_items.insert_one(item_doc)
    # Return without MongoDB's _id
    item_doc.pop('_id', None)
    return item_doc

@api_router.get("/items")
async def get_items(
    bucket_type: Optional[str] = None,
    completed: Optional[bool] = None,
    archived: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Get bucket items for user (and partner if joint)"""
    user_ids = [current_user["user_id"]]
    if current_user.get("partner_id"):
        user_ids.append(current_user["partner_id"])
    
    query = {"archived": archived}
    
    if bucket_type == "personal":
        query["user_id"] = current_user["user_id"]
        query["bucket_type"] = "personal"
    elif bucket_type == "joint":
        query["user_id"] = {"$in": user_ids}
        query["bucket_type"] = "joint"
    else:
        # All items for user and partner
        query["$or"] = [
            {"user_id": current_user["user_id"]},
            {"user_id": {"$in": user_ids}, "bucket_type": "joint"}
        ]
    
    if completed is not None:
        query["completed"] = completed
    
    items = await db.bucket_items.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items

@api_router.put("/items/{item_id}/complete")
async def complete_item(item_id: str, current_user: dict = Depends(get_current_user)):
    """Mark item as complete and award coins"""
    item = await db.bucket_items.find_one({"item_id": item_id}, {"_id": 0})
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item["completed"]:
        raise HTTPException(status_code=400, detail="Item already completed")
    
    # Update item
    await db.bucket_items.update_one(
        {"item_id": item_id},
        {"$set": {
            "completed": True,
            "completed_by": current_user["user_id"],
            "completed_at": datetime.now(timezone.utc)
        }}
    )
    
    # Award coins
    coin_field = "coins_joint" if item["bucket_type"] == "joint" else "coins_personal"
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$inc": {coin_field: item["reward"]}}
    )
    
    # Get updated user
    updated_user = await db.users.find_one(
        {"user_id": current_user["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    
    return {
        "message": "Item completed!",
        "coins_earned": item["reward"],
        "coins_joint": updated_user.get("coins_joint", 0),
        "coins_personal": updated_user.get("coins_personal", 0)
    }

@api_router.put("/items/{item_id}/archive")
async def archive_item(item_id: str, current_user: dict = Depends(get_current_user)):
    """Archive an item"""
    result = await db.bucket_items.update_one(
        {"item_id": item_id},
        {"$set": {"archived": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"message": "Item archived"}

@api_router.delete("/items/{item_id}")
async def delete_item(item_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an item"""
    result = await db.bucket_items.delete_one({"item_id": item_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"message": "Item deleted"}

# ============ REWARDS ENDPOINTS ============

@api_router.post("/rewards")
async def create_reward(reward_data: RewardCreate, current_user: dict = Depends(get_current_user)):
    """Create a new reward"""
    reward_id = f"reward_{uuid.uuid4().hex[:12]}"
    
    reward_doc = {
        "reward_id": reward_id,
        "user_id": current_user["user_id"],
        "title": reward_data.title,
        "cost": reward_data.cost,
        "reward_type": reward_data.reward_type,
        "icon": reward_data.icon,
        "is_goal": reward_data.is_goal,
        "redeemed": False,
        "redeemed_at": None,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.rewards.insert_one(reward_doc)
    # Return without MongoDB's _id
    reward_doc.pop('_id', None)
    return reward_doc

@api_router.get("/rewards")
async def get_rewards(
    reward_type: Optional[str] = None,
    is_goal: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get rewards for user"""
    user_ids = [current_user["user_id"]]
    if current_user.get("partner_id"):
        user_ids.append(current_user["partner_id"])
    
    query = {"redeemed": False}
    
    if reward_type == "personal":
        query["user_id"] = current_user["user_id"]
        query["reward_type"] = "personal"
    elif reward_type == "joint":
        query["user_id"] = {"$in": user_ids}
        query["reward_type"] = "joint"
    else:
        query["user_id"] = {"$in": user_ids}
    
    if is_goal is not None:
        query["is_goal"] = is_goal
    
    rewards = await db.rewards.find(query, {"_id": 0}).to_list(1000)
    return rewards

@api_router.post("/rewards/{reward_id}/redeem")
async def redeem_reward(reward_id: str, current_user: dict = Depends(get_current_user)):
    """Redeem a reward"""
    reward = await db.rewards.find_one({"reward_id": reward_id}, {"_id": 0})
    
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    if reward["redeemed"]:
        raise HTTPException(status_code=400, detail="Reward already redeemed")
    
    # Check coins
    coin_field = "coins_joint" if reward["reward_type"] == "joint" else "coins_personal"
    current_coins = current_user.get(coin_field, 0)
    
    if current_coins < reward["cost"]:
        raise HTTPException(status_code=400, detail="Not enough coins")
    
    # Deduct coins
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$inc": {coin_field: -reward["cost"]}}
    )
    
    # Mark as redeemed
    await db.rewards.update_one(
        {"reward_id": reward_id},
        {"$set": {"redeemed": True, "redeemed_at": datetime.now(timezone.utc)}}
    )
    
    # Get updated user
    updated_user = await db.users.find_one(
        {"user_id": current_user["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    
    return {
        "message": f"Redeemed: {reward['title']}!",
        "coins_spent": reward["cost"],
        "coins_joint": updated_user.get("coins_joint", 0),
        "coins_personal": updated_user.get("coins_personal", 0)
    }

# ============ AI ENDPOINTS ============

@api_router.post("/ai/insight")
async def get_ai_insight(insight_req: AIInsightRequest, current_user: dict = Depends(get_current_user)):
    """Get AI-powered insight based on context"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    if not EMERGENT_LLM_KEY:
        return {"insight": "Complete some tasks today to earn coins! 🎯"}
    
    # Get user's pending items
    items = await db.bucket_items.find(
        {"user_id": current_user["user_id"], "completed": False, "archived": False},
        {"_id": 0}
    ).to_list(50)
    
    # Get partner name
    partner_name = None
    if current_user.get("partner_id"):
        partner = await db.users.find_one({"user_id": current_user["partner_id"]}, {"_id": 0, "name": 1})
        if partner:
            partner_name = partner.get("name")
    
    # Build context
    pending_tasks = [item["title"] for item in items if item["item_type"] == "task"][:5]
    high_priority = [item["title"] for item in items if item["priority"] == "high"][:3]
    
    context = f"""
    User: {current_user['name']}
    Partner: {partner_name or 'Not linked'}
    Coins (Joint): {current_user.get('coins_joint', 0)}
    Coins (Personal): {current_user.get('coins_personal', 0)}
    Mood: {current_user.get('mood', 'happy')}
    Pending Tasks: {', '.join(pending_tasks) if pending_tasks else 'None'}
    High Priority: {', '.join(high_priority) if high_priority else 'None'}
    """
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"insight_{current_user['user_id']}_{datetime.now().timestamp()}",
            system_message="You are a friendly AI assistant for a couples task management app called Bucket Keeper. Give short, helpful, and encouraging insights (1-2 sentences max). Be warm but concise. If there's a partner, you can suggest collaboration."
        ).with_model("gemini", "gemini-2.5-flash")
        
        user_message = UserMessage(text=f"Based on this context, give a brief helpful insight for the {insight_req.context} screen:\n{context}")
        response = await chat.send_message(user_message)
        
        return {"insight": response}
    except Exception as e:
        logging.error(f"AI insight error: {e}")
        return {"insight": "Keep up the great work! Complete tasks to earn more coins. 💪"}

@api_router.post("/ai/daily-plan")
async def get_daily_plan(current_user: dict = Depends(get_current_user)):
    """Get AI-generated daily plan"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    if not EMERGENT_LLM_KEY:
        return {"plan": ["Check your buckets", "Complete a task", "Update your mood"]}
    
    # Get items
    items = await db.bucket_items.find(
        {"user_id": current_user["user_id"], "completed": False, "archived": False},
        {"_id": 0}
    ).to_list(20)
    
    tasks = [{"title": i["title"], "priority": i["priority"], "due_date": str(i.get("due_date", "No date"))} for i in items]
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"plan_{current_user['user_id']}_{datetime.now().timestamp()}",
            system_message="You are a helpful productivity assistant. Generate a simple 3-5 item daily plan based on the user's pending tasks. Be concise. Return only the plan items as a numbered list, nothing else."
        ).with_model("gemini", "gemini-2.5-flash")
        
        user_message = UserMessage(text=f"Create a daily plan from these tasks: {tasks}")
        response = await chat.send_message(user_message)
        
        # Parse response into list
        lines = [line.strip() for line in response.split('\n') if line.strip()]
        plan = [line.lstrip('0123456789.-) ') for line in lines if line][:5]
        
        return {"plan": plan if plan else ["Check your pending tasks", "Complete one high-priority item"]}
    except Exception as e:
        logging.error(f"Daily plan error: {e}")
        return {"plan": ["Review your buckets", "Complete a task", "Check on your partner"]}

# ============ STATS ENDPOINTS ============

@api_router.get("/stats/snapshot")
async def get_snapshot(current_user: dict = Depends(get_current_user)):
    """Get today's snapshot for home screen"""
    user_ids = [current_user["user_id"]]
    partner = None
    
    if current_user.get("partner_id"):
        user_ids.append(current_user["partner_id"])
        partner = await db.users.find_one(
            {"user_id": current_user["partner_id"]},
            {"_id": 0, "name": 1, "mood": 1, "mood_emoji": 1}
        )
    
    # Get today's items
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # User's pending count
    my_pending = await db.bucket_items.count_documents({
        "user_id": current_user["user_id"],
        "completed": False,
        "archived": False
    })
    
    # Joint pending count
    joint_pending = await db.bucket_items.count_documents({
        "user_id": {"$in": user_ids},
        "bucket_type": "joint",
        "completed": False,
        "archived": False
    })
    
    # Completed today
    completed_today = await db.bucket_items.count_documents({
        "user_id": current_user["user_id"],
        "completed": True,
        "completed_at": {"$gte": today_start}
    })
    
    return {
        "me": {
            "pending": my_pending,
            "completed_today": completed_today,
            "mood": current_user.get("mood", "happy"),
            "mood_emoji": current_user.get("mood_emoji", "😊")
        },
        "us": {
            "pending": joint_pending
        },
        "partner": {
            "name": partner.get("name") if partner else None,
            "mood": partner.get("mood") if partner else None,
            "mood_emoji": partner.get("mood_emoji") if partner else None
        } if partner else None
    }

@api_router.get("/stats/priorities")
async def get_priorities(current_user: dict = Depends(get_current_user)):
    """Get high priority items"""
    user_ids = [current_user["user_id"]]
    if current_user.get("partner_id"):
        user_ids.append(current_user["partner_id"])
    
    items = await db.bucket_items.find(
        {
            "user_id": {"$in": user_ids},
            "priority": "high",
            "completed": False,
            "archived": False
        },
        {"_id": 0}
    ).sort("created_at", -1).to_list(5)
    
    return items

# ============ ROOT ENDPOINT ============

@api_router.get("/")
async def root():
    return {"message": "Bucket Keeper API", "status": "running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
