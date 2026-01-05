const API_BASE = '/api';

// Frontend types (with stricter typing)
type BucketItem = {
  id: string;
  title: string;
  type: string;
  bucket: string;
  dueDate?: Date | null;
  completed: boolean;
  completedAt?: Date | null;
  coinsReward: number;
  ownerId?: string | null;
  assigneeId?: string | null;
  syncToCalendar?: boolean | null;
  priority?: string | null;
  frequency?: string | null;
  conflictPotential?: boolean | null;
};

type Reward = {
  id: string;
  title: string;
  cost: number;
  type: string;
  icon: string | null;
  userId?: string | null;
};

type User = {
  id: string;
  name: string;
  username?: string;
  avatar?: string | null;
  personalCoins: number;
  jointCoins: number;
  mood?: string | null;
};

// --- Items API ---
export async function fetchItems(userId?: string): Promise<BucketItem[]> {
  const url = userId ? `${API_BASE}/items?userId=${userId}` : `${API_BASE}/items`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function createItem(item: Omit<BucketItem, 'id' | 'createdAt'>): Promise<BucketItem> {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to create item');
  return res.json();
}

export async function toggleItem(id: string): Promise<BucketItem> {
  const res = await fetch(`${API_BASE}/items/${id}/toggle`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle item');
  return res.json();
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete item');
}

// --- Rewards API ---
export async function fetchRewards(userId?: string): Promise<Reward[]> {
  const url = userId ? `${API_BASE}/rewards?userId=${userId}` : `${API_BASE}/rewards`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch rewards');
  return res.json();
}

export async function createReward(reward: Omit<Reward, 'id' | 'createdAt'>): Promise<Reward> {
  const res = await fetch(`${API_BASE}/rewards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reward),
  });
  if (!res.ok) throw new Error('Failed to create reward');
  return res.json();
}

export async function deleteReward(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/rewards/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete reward');
}

// --- User API ---
export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function updateUserCoins(id: string, personalCoins?: number, jointCoins?: number): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${id}/coins`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personalCoins, jointCoins }),
  });
  if (!res.ok) throw new Error('Failed to update coins');
  return res.json();
}

export async function updateUserMood(id: string, mood: string): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${id}/mood`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood }),
  });
  if (!res.ok) throw new Error('Failed to update mood');
  return res.json();
}

// --- AI Features (Using Real Context) ---

export interface DailyPlan {
  greeting: string;
  priorityTasks: string[];
  insight: string;
  encouragement: string;
  conflictWarning: string | null;
  rewardSuggestion: string | null;
}

export interface BucketInsights {
  status: 'on_track' | 'needs_attention' | 'falling_behind';
  tip: string;
  quickWin: string | null;
}

export interface StoreRecommendations {
  recommendation: string;
  motivation: string;
  celebration: string | null;
}

export interface ConflictResolution {
  hasConflict: boolean;
  conflictDescription: string;
  optionA: string;
  optionB: string;
  balanceTip: string | null;
}

export async function getDailyPlan(userId?: string): Promise<DailyPlan> {
  const res = await fetch(`${API_BASE}/ai/daily-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to get daily plan');
  return res.json();
}

export async function getBucketInsights(bucket: string, userId?: string): Promise<BucketInsights> {
  const res = await fetch(`${API_BASE}/ai/bucket-insights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, userId }),
  });
  if (!res.ok) throw new Error('Failed to get bucket insights');
  return res.json();
}

export async function getStoreRecommendations(userId?: string): Promise<StoreRecommendations> {
  const res = await fetch(`${API_BASE}/ai/store-recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to get store recommendations');
  return res.json();
}

export async function getConflictResolution(userId?: string): Promise<ConflictResolution> {
  const res = await fetch(`${API_BASE}/ai/conflict-resolution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to resolve conflict');
  return res.json();
}

export async function getAISuggestions(type: string, userId?: string): Promise<{ suggestion?: string; ideas?: string[] }> {
  const res = await fetch(`${API_BASE}/ai/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, userId }),
  });
  if (!res.ok) throw new Error('Failed to get suggestions');
  return res.json();
}

export async function generateTheme(userId?: string): Promise<{ primary: string; secondary: string; background: string; name: string }> {
  const res = await fetch(`${API_BASE}/ai/theme-generator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to generate theme');
  return res.json();
}

// --- Calendar API ---

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  description?: string;
}

export async function getCalendarStatus(): Promise<{ connected: boolean }> {
  const res = await fetch(`${API_BASE}/calendar/status`);
  return res.json();
}

export async function getCalendarEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams();
  if (timeMin) params.append('timeMin', timeMin);
  if (timeMax) params.append('timeMax', timeMax);
  
  const res = await fetch(`${API_BASE}/calendar/events?${params}`);
  if (!res.ok) throw new Error('Failed to fetch calendar events');
  return res.json();
}

export async function syncItemToCalendar(item: { itemId: string; title: string; dueDate: string; description?: string }): Promise<{ success: boolean; eventId?: string }> {
  const res = await fetch(`${API_BASE}/calendar/sync-item`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to sync item to calendar');
  return res.json();
}
