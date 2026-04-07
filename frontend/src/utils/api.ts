import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Add auth header interceptor
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface BucketItem {
  item_id: string;
  user_id: string;
  title: string;
  bucket_type: 'joint' | 'personal';
  item_type: 'task' | 'goal' | 'habit';
  reward: number;
  assignee: 'me' | 'partner' | 'anyone';
  priority: 'low' | 'medium' | 'high';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  due_date?: string;
  description?: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
  archived: boolean;
  created_at: string;
}

export interface Reward {
  reward_id: string;
  user_id: string;
  title: string;
  cost: number;
  reward_type: 'personal' | 'joint';
  icon?: string;
  is_goal: boolean;
  redeemed: boolean;
  redeemed_at?: string;
  created_at: string;
}

export interface Snapshot {
  me: {
    pending: number;
    completed_today: number;
    mood: string;
    mood_emoji: string;
  };
  us: {
    pending: number;
  };
  partner?: {
    name: string | null;
    mood: string | null;
    mood_emoji: string | null;
  };
}

// Items API
export const itemsApi = {
  getAll: (params?: { bucket_type?: string; completed?: boolean; archived?: boolean }) =>
    api.get<BucketItem[]>('/items', { params }),
  
  create: (data: Partial<BucketItem>) =>
    api.post<BucketItem>('/items', data),
  
  complete: (itemId: string) =>
    api.put(`/items/${itemId}/complete`),
  
  archive: (itemId: string) =>
    api.put(`/items/${itemId}/archive`),
  
  delete: (itemId: string) =>
    api.delete(`/items/${itemId}`),
};

// Rewards API
export const rewardsApi = {
  getAll: (params?: { reward_type?: string; is_goal?: boolean }) =>
    api.get<Reward[]>('/rewards', { params }),
  
  create: (data: Partial<Reward>) =>
    api.post<Reward>('/rewards', data),
  
  redeem: (rewardId: string) =>
    api.post(`/rewards/${rewardId}/redeem`),
};

// Stats API
export const statsApi = {
  getSnapshot: () =>
    api.get<Snapshot>('/stats/snapshot'),
  
  getPriorities: () =>
    api.get<BucketItem[]>('/stats/priorities'),
};

// AI API
export const aiApi = {
  getInsight: (context: string = 'home', aiContext?: any) =>
    api.post<{ insight: string }>('/ai/insight', { context, ai_context: aiContext }),

  getDailyPlan: (aiContext?: any) =>
    api.post<{ plan: string[] }>('/ai/daily-plan', { ai_context: aiContext }),

  extractTasks: (transcript: string) =>
    api.post<{ tasks: Array<{
      title: string;
      assignedTo: string | null;
      isJoint: boolean;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      category: string;
      dateText: string | null;
      timeText: string | null;
      isRecurring: boolean;
      recurringPattern: string | null;
    }> }>('/ai/extract-tasks', { transcript }),

  chat: (message: string, conversationId?: string, aiContext?: any) =>
    api.post<{ response: string; conversationId: string }>('/ai/chat', {
      message,
      conversation_id: conversationId,
      ai_context: aiContext,
    }),
};

// Calendar API
export const calendarApi = {
  getStatus: () =>
    api.get<{ connected: boolean; provider: string | null; email: string | null }>('/calendar/status'),

  getEvents: () =>
    api.get<Array<{ id: string; title: string; startTime: string; endTime: string; isAllDay: boolean }>>('/calendar/events'),

  syncItem: (itemId: string) =>
    api.post<{ calendarEventId: string }>(`/calendar/sync-item`, { item_id: itemId }),
};

// Sync API (SQLite <-> Backend)
export const syncApi = {
  pushLocal: (changes: { created: any[]; updated: any[]; deleted: string[] }) =>
    api.post('/sync/push', changes),

  pullRemote: (lastSyncTimestamp: number) =>
    api.get<{ items: any[]; rewards: any[]; timestamp: number }>('/sync/pull', {
      params: { since: lastSyncTimestamp },
    }),
};

export default api;
