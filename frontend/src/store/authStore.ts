import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  coins_joint: number;
  coins_personal: number;
  mood?: string;
  mood_emoji?: string;
  partner_id?: string;
  partner_code?: string;
  partner_name?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionToken: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSessionToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  processOAuthSession: (sessionId: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateCoins: (joint: number, personal: number) => void;
  updateMood: (mood: string, emoji: string) => Promise<void>;
  linkPartner: (code: string) => Promise<string>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  sessionToken: null,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setSessionToken: async (token) => {
    if (token) {
      await AsyncStorage.setItem('session_token', token);
    } else {
      await AsyncStorage.removeItem('session_token');
    }
    set({ sessionToken: token });
  },
  
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      }, { withCredentials: true });
      
      set({ user: response.data, isAuthenticated: true });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },
  
  register: async (email, password, name) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name,
      }, { withCredentials: true });
      
      set({ user: response.data, isAuthenticated: true });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },
  
  processOAuthSession: async (sessionId) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/session`, {
        session_id: sessionId,
      }, { withCredentials: true });
      
      set({ user: response.data, isAuthenticated: true });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'OAuth failed');
    }
  },
  
  logout: async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      // Ignore logout errors
    }
    await AsyncStorage.removeItem('session_token');
    set({ user: null, isAuthenticated: false, sessionToken: null });
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('session_token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
        headers,
      });
      
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  
  updateCoins: (joint, personal) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, coins_joint: joint, coins_personal: personal } });
    }
  },
  
  updateMood: async (mood, emoji) => {
    try {
      const token = await AsyncStorage.getItem('session_token');
      await axios.put(`${API_URL}/api/user/mood`, 
        { mood, mood_emoji: emoji },
        { 
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      
      const { user } = get();
      if (user) {
        set({ user: { ...user, mood, mood_emoji: emoji } });
      }
    } catch (error) {
      console.error('Failed to update mood:', error);
    }
  },
  
  linkPartner: async (code) => {
    try {
      const token = await AsyncStorage.getItem('session_token');
      const response = await axios.post(`${API_URL}/api/user/link-partner`,
        { partner_code: code },
        { 
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      
      const { user } = get();
      if (user) {
        set({ user: { ...user, partner_name: response.data.partner_name, partner_id: 'linked' } });
      }
      return response.data.partner_name;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to link partner');
    }
  },
}));
