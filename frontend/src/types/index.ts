// Bucket Keeper - Shared Type Definitions

// ── SQLite Models ──────────────────────────────────────────────

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: number;
}

export interface User {
  id: string;
  householdId: string;
  name: string;
  avatarColor: string;
  isCurrentUser: boolean;
  createdAt: number;
}

export interface Bucket {
  id: string;
  householdId: string;
  name: string;
  color: string;
  isJoint: boolean;
  isShared: boolean;
  ownerId: string | null;
  icon: string;
  createdAt: number;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'home' | 'errands' | 'health' | 'work' | 'personal' | 'kids';
export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | string;
export type ItemType = 'task' | 'goal' | 'habit';
export type BucketType = 'joint' | 'personal';
export type Assignee = 'me' | 'partner' | 'anyone';
export type Frequency = 'once' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  bucketId: string;
  householdId: string;
  title: string;
  assignedToUserId: string | null;
  assignee: Assignee;
  isJoint: boolean;
  itemType: ItemType;
  priority: Priority;
  category: TaskCategory;
  reward: number;
  dateMs: number | null;
  timeMs: number | null;
  isRecurring: boolean;
  recurringPattern: RecurringPattern | null;
  frequency: Frequency;
  isComplete: boolean;
  completedAt: number | null;
  completedBy: string | null;
  calendarEventId: string | null;
  focusTimeMs: number;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FocusSession {
  id: string;
  taskId: string;
  userId: string;
  startedAt: number;
  endedAt: number | null;
  durationMs: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

// ── Reward Models ──────────────────────────────────────────────

export interface Reward {
  id: string;
  userId: string;
  title: string;
  cost: number;
  rewardType: 'personal' | 'joint';
  icon: string | null;
  isGoal: boolean;
  redeemed: boolean;
  redeemedAt: string | null;
  createdAt: string;
}

// ── User / Auth Models ─────────────────────────────────────────

export interface AuthUser {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  coins_joint: number;
  coins_personal: number;
  mood?: MoodType;
  mood_emoji?: string;
  partner_id?: string;
  partner_code?: string;
  partner_name?: string;
}

// ── Mood ───────────────────────────────────────────────────────

export type MoodType = 'energized' | 'happy' | 'calm' | 'romantic' | 'tired' | 'stressed';

export interface MoodOption {
  key: MoodType;
  label: string;
  emoji: string;
  color: string;
}

// ── Snapshot / Stats ───────────────────────────────────────────

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

// ── AI Types ───────────────────────────────────────────────────

export type AIContextScope = 'home' | 'buckets' | 'store';

export interface AIContext {
  scope: AIContextScope;
  user: {
    name: string;
    mood: string | null;
    coinsJoint: number;
    coinsPersonal: number;
  };
  partner: {
    name: string | null;
    mood: string | null;
  } | null;
  tasks: {
    pendingCount: number;
    completedTodayCount: number;
    overdueCount: number;
    highPriorityCount: number;
  };
  patterns: {
    completionStreak: number;
    weeklyAverage: number;
    partnerBalanceScore: number; // -1 to 1, negative means user does more
  };
  rewards: {
    availableCount: number;
    totalCoinsEarned: number;
  };
}

export interface ExtractedTask {
  title: string;
  assignedTo: string | null;
  isJoint: boolean;
  priority: Priority;
  category: TaskCategory;
  dateText: string | null;
  timeText: string | null;
  isRecurring: boolean;
  recurringPattern: string | null;
}

export interface DailyPlanItem {
  title: string;
  timeBlock: string | null;
  priority: Priority;
  suggestion: string;
}

// ── Theme Types ────────────────────────────────────────────────

export type ThemeMode = 'dark' | 'light';

export type ThemeName =
  | 'default'
  | 'couples'
  | 'friends'
  | 'family'
  | 'roommates';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  gradientStart: string;
  gradientEnd: string;
  success: string;
  warning: string;
  error: string;
  priorityUrgent: string;
  priorityHigh: string;
  priorityNormal: string;
  priorityLow: string;
  tabBar: string;
  tabBarBorder: string;
}

// ── Calendar Types ─────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
}

export interface CalendarStatus {
  connected: boolean;
  provider: 'google' | null;
  email: string | null;
}
