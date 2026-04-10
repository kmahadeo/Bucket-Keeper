import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEMO_MODE,
  mockDelay,
  mockSnapshot,
  mockPriorities,
  mockAllItems,
  mockCompletedItems,
  mockRewards,
  mockAIInsight,
  mockAIInsightStore,
  mockDailyPlan,
  mockCalendarStatus,
  mockCalendarEvents,
  mockChatResponse,
} from './demoMode';

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

// ── In-memory mock store (for demo CRUD) ───────────────────────
let demoItems: BucketItem[] = [...mockAllItems] as BucketItem[];
let demoRewards: Reward[] = [...mockRewards] as Reward[];

// Items API
export const itemsApi = {
  getAll: (params?: { bucket_type?: string; completed?: boolean; archived?: boolean }) => {
    if (DEMO_MODE) {
      let filtered = demoItems;
      if (params?.completed !== undefined) {
        filtered = filtered.filter((i) => i.completed === params.completed);
      }
      if (params?.archived !== undefined) {
        filtered = filtered.filter((i) => i.archived === params.archived);
      }
      if (params?.bucket_type) {
        filtered = filtered.filter((i) => i.bucket_type === params.bucket_type);
      }
      return mockDelay(filtered);
    }
    return api.get<BucketItem[]>('/items', { params });
  },

  create: (data: Partial<BucketItem>) => {
    if (DEMO_MODE) {
      const newItem: BucketItem = {
        item_id: `demo-${Date.now()}`,
        user_id: 'demo-user-1',
        title: data.title ?? 'New Task',
        bucket_type: data.bucket_type ?? 'personal',
        item_type: data.item_type ?? 'task',
        reward: data.reward ?? 10,
        assignee: data.assignee ?? 'me',
        priority: data.priority ?? 'medium',
        frequency: data.frequency ?? 'once',
        completed: false,
        archived: false,
        created_at: new Date().toISOString(),
      };
      demoItems = [newItem, ...demoItems];
      return mockDelay(newItem);
    }
    return api.post<BucketItem>('/items', data);
  },

  complete: (itemId: string) => {
    if (DEMO_MODE) {
      demoItems = demoItems.map((i) =>
        i.item_id === itemId
          ? { ...i, completed: true, completed_at: new Date().toISOString(), completed_by: 'demo-user-1' }
          : i,
      );
      return mockDelay({ success: true });
    }
    return api.put(`/items/${itemId}/complete`);
  },

  archive: (itemId: string) => {
    if (DEMO_MODE) {
      demoItems = demoItems.map((i) =>
        i.item_id === itemId ? { ...i, archived: true } : i,
      );
      return mockDelay({ success: true });
    }
    return api.put(`/items/${itemId}/archive`);
  },

  delete: (itemId: string) => {
    if (DEMO_MODE) {
      demoItems = demoItems.filter((i) => i.item_id !== itemId);
      return mockDelay({ success: true });
    }
    return api.delete(`/items/${itemId}`);
  },
};

// Rewards API
export const rewardsApi = {
  getAll: (params?: { reward_type?: string; is_goal?: boolean }) => {
    if (DEMO_MODE) {
      let filtered = demoRewards;
      if (params?.reward_type) {
        filtered = filtered.filter((r) => r.reward_type === params.reward_type);
      }
      if (params?.is_goal !== undefined) {
        filtered = filtered.filter((r) => r.is_goal === params.is_goal);
      }
      return mockDelay(filtered);
    }
    return api.get<Reward[]>('/rewards', { params });
  },

  create: (data: Partial<Reward>) => {
    if (DEMO_MODE) {
      const newReward: Reward = {
        reward_id: `demo-r-${Date.now()}`,
        user_id: 'demo-user-1',
        title: data.title ?? 'New Reward',
        cost: data.cost ?? 50,
        reward_type: data.reward_type ?? 'personal',
        icon: data.icon,
        is_goal: data.is_goal ?? false,
        redeemed: false,
        created_at: new Date().toISOString(),
      };
      demoRewards = [...demoRewards, newReward];
      return mockDelay(newReward);
    }
    return api.post<Reward>('/rewards', data);
  },

  redeem: (rewardId: string) => {
    if (DEMO_MODE) {
      demoRewards = demoRewards.map((r) =>
        r.reward_id === rewardId ? { ...r, redeemed: true, redeemed_at: new Date().toISOString() } : r,
      );
      return mockDelay({ success: true });
    }
    return api.post(`/rewards/${rewardId}/redeem`);
  },
};

// Stats API
export const statsApi = {
  getSnapshot: () => {
    if (DEMO_MODE) return mockDelay(mockSnapshot as Snapshot);
    return api.get<Snapshot>('/stats/snapshot');
  },

  getPriorities: () => {
    if (DEMO_MODE) return mockDelay(mockPriorities as BucketItem[]);
    return api.get<BucketItem[]>('/stats/priorities');
  },
};

// AI API
export const aiApi = {
  getInsight: (context: string = 'home', aiContext?: any) => {
    if (DEMO_MODE) {
      const insight = context === 'store' ? mockAIInsightStore : mockAIInsight;
      return mockDelay({ insight }, 800);
    }
    return api.post<{ insight: string }>('/ai/insight', { context, ai_context: aiContext });
  },

  getDailyPlan: (aiContext?: any) => {
    if (DEMO_MODE) return mockDelay({ plan: mockDailyPlan }, 1500);
    return api.post<{ plan: string[] }>('/ai/daily-plan', { ai_context: aiContext });
  },

  extractTasks: (transcript: string) => {
    if (DEMO_MODE) {
      return mockDelay({
        tasks: [
          {
            title: transcript || 'Pick up groceries',
            assignedTo: null,
            isJoint: true,
            priority: 'medium' as const,
            category: 'errands',
            dateText: 'tomorrow',
            timeText: null,
            isRecurring: false,
            recurringPattern: null,
          },
        ],
      }, 1000);
    }
    return api.post<{ tasks: Array<{
      title: string;
      assignedTo: string | null;
      isJoint: boolean;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      category: string;
      dateText: string | null;
      timeText: string | null;
      isRecurring: boolean;
      recurringPattern: string | null;
    }> }>('/ai/extract-tasks', { transcript });
  },

  chat: (message: string, conversationId?: string, aiContext?: any) => {
    if (DEMO_MODE) return mockDelay(mockChatResponse(message), 1200);
    return api.post<{ response: string; conversationId: string }>('/ai/chat', {
      message,
      conversation_id: conversationId,
      ai_context: aiContext,
    });
  },
};

// Calendar API
export const calendarApi = {
  getStatus: () => {
    if (DEMO_MODE) return mockDelay(mockCalendarStatus);
    return api.get<{ connected: boolean; provider: string | null; email: string | null }>('/calendar/status');
  },

  getEvents: () => {
    if (DEMO_MODE) return mockDelay(mockCalendarEvents);
    return api.get<Array<{ id: string; title: string; startTime: string; endTime: string; isAllDay: boolean }>>('/calendar/events');
  },

  syncItem: (itemId: string) => {
    if (DEMO_MODE) return mockDelay({ calendarEventId: `cal-${itemId}` });
    return api.post<{ calendarEventId: string }>(`/calendar/sync-item`, { item_id: itemId });
  },
};

// Sync API (SQLite <-> Backend)
export const syncApi = {
  pushLocal: (changes: { created: any[]; updated: any[]; deleted: string[] }) => {
    if (DEMO_MODE) return mockDelay({ success: true });
    return api.post('/sync/push', changes);
  },

  pullRemote: (lastSyncTimestamp: number) => {
    if (DEMO_MODE) return mockDelay({ items: [], rewards: [], timestamp: Date.now() });
    return api.get<{ items: any[]; rewards: any[]; timestamp: number }>('/sync/pull', {
      params: { since: lastSyncTimestamp },
    });
  },
};

export default api;
