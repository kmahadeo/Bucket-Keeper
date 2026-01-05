import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays, format, subDays } from 'date-fns';

// --- Types ---

export type User = {
  id: string;
  name: string;
  avatar: string; // URL or ID
  personalCoins: number;
  jointCoins: number; // Shared pool technically, but accessible here
  mood: Mood | null;
};

export type Mood = 'happy' | 'calm' | 'stressed' | 'anxious' | 'irritated' | 'sad' | 'energized' | 'tired';

export type BucketType = 'personal' | 'partner' | 'joint';

export type ItemType = 'task' | 'event' | 'routine';

export type BucketItem = {
  id: string;
  title: string;
  type: ItemType;
  bucket: BucketType;
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
  coinsReward: number;
  ownerId?: string; // Who created it
  assigneeId?: string; // Who should do it
};

export type Reward = {
  id: string;
  title: string;
  cost: number;
  type: 'personal_treat' | 'partner_gift' | 'joint_goal';
  icon: string;
};

// --- Mock Data ---

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
  { id: '1', title: 'Buy groceries for taco night', type: 'task', bucket: 'joint', coinsReward: 10, completed: false },
  { id: '2', title: 'Morning Run (5k)', type: 'routine', bucket: 'personal', coinsReward: 5, completed: true, completedAt: new Date() },
  { id: '3', title: 'Date Night: Sushi', type: 'event', bucket: 'joint', dueDate: addDays(new Date(), 2), coinsReward: 50, completed: false },
  { id: '4', title: 'Call Mom', type: 'task', bucket: 'personal', dueDate: new Date(), coinsReward: 10, completed: false },
  { id: '5', title: 'Book flights for Paris', type: 'task', bucket: 'joint', coinsReward: 100, completed: false },
  { id: '6', title: 'Margaux\'s Dentist Appt', type: 'event', bucket: 'partner', dueDate: addDays(new Date(), 5), coinsReward: 0, completed: false },
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
  setActiveBucket: (b: BucketType) => void;
  addItem: (item: Omit<BucketItem, 'id' | 'completed' | 'completedAt'>) => void;
  toggleItem: (id: string) => void;
  updateMood: (mood: Mood) => void;
  redeemReward: (rewardId: string) => void;
  deleteItem: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [partner, setPartner] = useState<User>(MOCK_PARTNER); // In a real app, this would be fetched
  const [items, setItems] = useState<BucketItem[]>(INITIAL_ITEMS);
  const [rewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [activeBucket, setActiveBucket] = useState<BucketType>('joint');

  // Load from local storage on mount (mock persistence)
  useEffect(() => {
    const savedItems = localStorage.getItem('bk_items');
    if (savedItems) {
      setItems(JSON.parse(savedItems, (key, value) => {
        if (key === 'dueDate' || key === 'completedAt') return value ? new Date(value) : undefined;
        return value;
      }));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('bk_items', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<BucketItem, 'id' | 'completed' | 'completedAt'>) => {
    const item: BucketItem = {
      ...newItem,
      id: Math.random().toString(36).substr(2, 9),
      completed: false,
    };
    setItems((prev) => [item, ...prev]);
  };

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((item) => {
      if (item.id === id) {
        const isCompleting = !item.completed;
        // Handle Coin Logic
        if (isCompleting) {
          if (item.bucket === 'personal') {
            setUser(u => ({ ...u, personalCoins: u.personalCoins + item.coinsReward }));
          } else if (item.bucket === 'joint') {
            setUser(u => ({ ...u, jointCoins: u.jointCoins + item.coinsReward }));
            setPartner(p => ({ ...p, jointCoins: p.jointCoins + item.coinsReward })); // Sync joint coins
          }
        } else {
          // Reverting completion (subtract coins)
          if (item.bucket === 'personal') {
            setUser(u => ({ ...u, personalCoins: u.personalCoins - item.coinsReward }));
          } else if (item.bucket === 'joint') {
            setUser(u => ({ ...u, jointCoins: u.jointCoins - item.coinsReward }));
            setPartner(p => ({ ...p, jointCoins: p.jointCoins - item.coinsReward }));
          }
        }

        return {
          ...item,
          completed: isCompleting,
          completedAt: isCompleting ? new Date() : undefined
        };
      }
      return item;
    }));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter(i => i.id !== id));
  };

  const updateMood = (mood: Mood) => {
    setUser((prev) => ({ ...prev, mood }));
  };

  const redeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    if (reward.type === 'personal_treat' || reward.type === 'partner_gift') {
      if (user.personalCoins >= reward.cost) {
        setUser(u => ({ ...u, personalCoins: u.personalCoins - reward.cost }));
        // Trigger generic success toast here in UI
      }
    } else if (reward.type === 'joint_goal') {
      if (user.jointCoins >= reward.cost) {
        setUser(u => ({ ...u, jointCoins: u.jointCoins - reward.cost }));
        setPartner(p => ({ ...p, jointCoins: p.jointCoins - reward.cost }));
      }
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      partner,
      items,
      rewards,
      activeBucket,
      setActiveBucket,
      addItem,
      toggleItem,
      updateMood,
      redeemReward,
      deleteItem
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
