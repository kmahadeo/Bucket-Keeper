import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays } from 'date-fns';
import * as api from './api';

// --- Types ---
export type User = {
  id: string;
  name: string;
  avatar: string;
  personalCoins: number;
  jointCoins: number;
  mood: Mood | null;
};

export type Mood = 'happy' | 'calm' | 'stressed' | 'anxious' | 'irritated' | 'sad' | 'energized' | 'tired';
export type BucketType = 'personal' | 'partner' | 'joint';
export type ItemType = 'task' | 'event' | 'routine' | 'calendar' | 'schedule' | 'chore' | 'habit';
export type Priority = 'high' | 'medium' | 'low';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'once';

export type BucketItem = {
  id: string;
  title: string;
  type: ItemType;
  bucket: BucketType;
  dueDate?: Date | null;
  completed: boolean;
  completedAt?: Date | null;
  coinsReward: number;
  ownerId?: string | null;
  assigneeId?: string | null;
  syncToCalendar?: boolean | null;
  priority?: Priority | null;
  frequency?: Frequency | null;
  conflictPotential?: boolean | null;
};

export type Reward = {
  id: string;
  title: string;
  cost: number;
  type: 'personal_treat' | 'partner_gift' | 'joint_goal';
  icon: string | null;
};

// --- Mock Data (for initial load) ---
import dogAvatar from '@assets/generated_images/cute_3d_minimalist_dog_avatar_for_app.png';
import catAvatar from '@assets/generated_images/cute_3d_minimalist_cat_avatar_for_app.png';

const MOCK_USER: User = {
  id: 'u1',
  name: 'Kaushik',
  avatar: dogAvatar,
  personalCoins: 120,
  jointCoins: 450,
  mood: 'energized',
};

const MOCK_PARTNER: User = {
  id: 'u2',
  name: 'Margaux',
  avatar: catAvatar,
  personalCoins: 85,
  jointCoins: 450,
  mood: 'calm',
};

const INITIAL_ITEMS: BucketItem[] = [
  { id: '1', title: 'Buy groceries for taco night', type: 'task', bucket: 'joint', coinsReward: 10, completed: false, priority: 'medium', ownerId: 'u1' },
  { id: '2', title: 'Morning Run (5k)', type: 'habit', bucket: 'personal', coinsReward: 5, completed: true, completedAt: new Date(), frequency: 'daily', assigneeId: 'u1', ownerId: 'u1' },
  { id: '3', title: 'Date Night: Sushi', type: 'event', bucket: 'joint', dueDate: addDays(new Date(), 2), coinsReward: 50, completed: false, syncToCalendar: true, priority: 'high', ownerId: 'u1' },
  { id: '4', title: 'Call Mom', type: 'task', bucket: 'personal', dueDate: new Date(), coinsReward: 10, completed: false, priority: 'low', ownerId: 'u1' },
  { id: '5', title: 'Book flights for Paris', type: 'task', bucket: 'joint', coinsReward: 100, completed: false, priority: 'high', conflictPotential: true, ownerId: 'u1' },
  { id: '6', title: 'Margaux\'s Dentist Appt', type: 'event', bucket: 'partner', dueDate: addDays(new Date(), 5), coinsReward: 0, completed: false, syncToCalendar: true, ownerId: 'u2' },
  { id: '7', title: 'Wash Dishes', type: 'chore', bucket: 'joint', coinsReward: 15, completed: false, frequency: 'daily', assigneeId: 'u1', ownerId: 'u1' },
  { id: '8', title: 'Laundry', type: 'chore', bucket: 'joint', coinsReward: 20, completed: false, frequency: 'weekly', assigneeId: 'u2', ownerId: 'u2' },
  { id: '9', title: 'Monthly Budget Review', type: 'task', bucket: 'joint', coinsReward: 50, completed: false, frequency: 'monthly', priority: 'high', conflictPotential: true, ownerId: 'u1' },
];

const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', title: 'Movie Night Pick', cost: 50, type: 'personal_treat', icon: '🎬' },
  { id: 'r2', title: 'Back Massage (15m)', cost: 100, type: 'partner_gift', icon: '💆‍♂️' },
  { id: 'r3', title: 'Weekend Getaway Fund', cost: 1000, type: 'joint_goal', icon: '✈️' },
];

// --- Store Context ---
interface AppState {
  user: User;
  partner: User;
  items: BucketItem[];
  rewards: Reward[];
  activeBucket: BucketType;
  apiKey: string;
  loading: boolean;
  setApiKey: (key: string) => void;
  setActiveBucket: (b: BucketType) => void;
  addItem: (item: Omit<BucketItem, 'id' | 'completed' | 'completedAt' | 'createdAt'>) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  updateMood: (mood: Mood) => Promise<void>;
  redeemReward: (rewardId: string) => void;
  deleteItem: (id: string) => Promise<void>;
  addReward: (reward: Omit<Reward, 'id' | 'createdAt'>) => Promise<void>;
  refreshItems: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [partner, setPartner] = useState<User>(MOCK_PARTNER);
  const [items, setItems] = useState<BucketItem[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activeBucket, setActiveBucket] = useState<BucketType>('joint');
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize with seed data on first load
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const existingItems = await api.fetchItems();
        
        if (existingItems.length === 0) {
          // Seed database with initial items
          for (const item of INITIAL_ITEMS) {
            await api.createItem(item as any);
          }
          await refreshItems();
        } else {
          setItems(existingItems.map(i => ({
            ...i,
            dueDate: i.dueDate ? new Date(i.dueDate) : null,
            completedAt: i.completedAt ? new Date(i.completedAt) : null,
          })) as any);
        }

        const existingRewards = await api.fetchRewards();
        if (existingRewards.length === 0) {
          // Seed rewards
          for (const reward of INITIAL_REWARDS) {
            await api.createReward({ ...reward, userId: user.id } as any);
          }
          const newRewards = await api.fetchRewards();
          setRewards(newRewards as any);
        } else {
          setRewards(existingRewards as any);
        }

        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize:', error);
        // Fallback to mock data if backend fails
        setItems(INITIAL_ITEMS);
        setRewards(INITIAL_REWARDS);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    if (!initialized) {
      init();
    }
  }, [initialized]);

  const refreshItems = async () => {
    try {
      const fetchedItems = await api.fetchItems();
      setItems(fetchedItems.map(i => ({
        ...i,
        dueDate: i.dueDate ? new Date(i.dueDate) : null,
        completedAt: i.completedAt ? new Date(i.completedAt) : null,
      })) as any);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const addItem = async (newItem: Omit<BucketItem, 'id' | 'completed' | 'completedAt' | 'createdAt'>) => {
    try {
      await api.createItem({
        ...newItem,
        completed: false,
        completedAt: null,
      } as any);
      await refreshItems();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const toggleItem = async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;

      const updatedItem = await api.toggleItem(id);
      
      // Update coins locally
      const isCompleting = updatedItem.completed;
      if (isCompleting) {
        if (item.bucket === 'personal') {
          setUser(u => ({ ...u, personalCoins: u.personalCoins + item.coinsReward }));
        } else if (item.bucket === 'joint') {
          setUser(u => ({ ...u, jointCoins: u.jointCoins + item.coinsReward }));
          setPartner(p => ({ ...p, jointCoins: p.jointCoins + item.coinsReward }));
        }
      } else {
        if (item.bucket === 'personal') {
          setUser(u => ({ ...u, personalCoins: u.personalCoins - item.coinsReward }));
        } else if (item.bucket === 'joint') {
          setUser(u => ({ ...u, jointCoins: u.jointCoins - item.coinsReward }));
          setPartner(p => ({ ...p, jointCoins: p.jointCoins - item.coinsReward }));
        }
      }

      await refreshItems();
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.deleteItem(id);
      await refreshItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const updateMood = async (mood: Mood) => {
    try {
      await api.updateUserMood(user.id, mood);
      setUser(prev => ({ ...prev, mood }));
    } catch (error) {
      console.error('Failed to update mood:', error);
      // Fallback to local update
      setUser(prev => ({ ...prev, mood }));
    }
  };

  const redeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    if (reward.type === 'personal_treat' || reward.type === 'partner_gift') {
      if (user.personalCoins >= reward.cost) {
        setUser(u => ({ ...u, personalCoins: u.personalCoins - reward.cost }));
      }
    } else if (reward.type === 'joint_goal') {
      if (user.jointCoins >= reward.cost) {
        setUser(u => ({ ...u, jointCoins: u.jointCoins - reward.cost }));
        setPartner(p => ({ ...p, jointCoins: p.jointCoins - reward.cost }));
      }
    }
  };

  const addReward = async (newReward: Omit<Reward, 'id' | 'createdAt'>) => {
    try {
      await api.createReward({ ...newReward, userId: user.id } as any);
      const updatedRewards = await api.fetchRewards();
      setRewards(updatedRewards as any);
    } catch (error) {
      console.error('Failed to add reward:', error);
    }
  };

  const value: AppState = {
    user,
    partner,
    items,
    rewards,
    activeBucket,
    apiKey,
    loading,
    setApiKey,
    setActiveBucket,
    addItem,
    toggleItem,
    updateMood,
    redeemReward,
    deleteItem,
    addReward,
    refreshItems,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
