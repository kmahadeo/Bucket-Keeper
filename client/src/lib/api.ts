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

// --- AI Features ---
export async function resolveConflict(event1: string, event2: string, context?: string): Promise<{ optionA: string; optionB: string }> {
  const res = await fetch(`${API_BASE}/ai/conflict-resolution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event1, event2, context }),
  });
  if (!res.ok) throw new Error('Failed to resolve conflict');
  return res.json();
}

export async function getAISuggestions(type: string, context?: string): Promise<{ suggestion: string }> {
  const res = await fetch(`${API_BASE}/ai/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, context }),
  });
  if (!res.ok) throw new Error('Failed to get suggestions');
  return res.json();
}

export async function generateTheme(vibe: string, mood: string): Promise<{ primary: string; secondary: string; background: string; name: string }> {
  const res = await fetch(`${API_BASE}/ai/theme-generator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vibe, mood }),
  });
  if (!res.ok) throw new Error('Failed to generate theme');
  return res.json();
}
