// Bucket Keeper - Demo Mode
// When EXPO_PUBLIC_DEMO_MODE=true, the app uses mock data instead of
// calling the backend. Used for GitHub Pages web demo.

export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

export function mockDelay<T>(data: T, ms: number = 300): Promise<{ data: T }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), ms);
  });
}

// ── Mock User ──────────────────────────────────────────────────

export const mockUser = {
  user_id: 'demo-user-1',
  email: 'kaushik@demo.com',
  name: 'Kaushik',
  coins_joint: 450,
  coins_personal: 120,
  mood: 'energized',
  mood_emoji: '🐶',
  partner_id: 'demo-partner-1',
  partner_code: 'DEMO42',
  partner_name: 'Margaux',
};

// ── Mock Snapshot ──────────────────────────────────────────────

export const mockSnapshot = {
  me: {
    pending: 4,
    completed_today: 3,
    mood: 'energized',
    mood_emoji: '🐶',
  },
  us: {
    pending: 2,
  },
  partner: {
    name: 'Margaux',
    mood: 'calm',
    mood_emoji: '🐱',
  },
};

// ── Mock Bucket Items (Priorities) ─────────────────────────────

const now = Date.now();
const daysAgo = (days: number) => new Date(now - days * 86400000).toISOString();

export const mockPriorities = [
  {
    item_id: 'task-1',
    user_id: 'demo-user-1',
    title: 'Pick up groceries for taco night',
    bucket_type: 'joint' as const,
    item_type: 'task' as const,
    reward: 25,
    assignee: 'anyone' as const,
    priority: 'high' as const,
    frequency: 'once' as const,
    due_date: new Date(now + 86400000).toISOString(),
    completed: false,
    archived: false,
    created_at: daysAgo(1),
  },
  {
    item_id: 'task-2',
    user_id: 'demo-user-1',
    title: 'Review budget for weekend trip',
    bucket_type: 'joint' as const,
    item_type: 'task' as const,
    reward: 50,
    assignee: 'me' as const,
    priority: 'high' as const,
    frequency: 'once' as const,
    completed: false,
    archived: false,
    created_at: daysAgo(2),
  },
  {
    item_id: 'task-3',
    user_id: 'demo-user-1',
    title: 'Schedule dentist appointment',
    bucket_type: 'personal' as const,
    item_type: 'task' as const,
    reward: 10,
    assignee: 'me' as const,
    priority: 'medium' as const,
    frequency: 'once' as const,
    completed: false,
    archived: false,
    created_at: daysAgo(3),
  },
  {
    item_id: 'task-4',
    user_id: 'demo-user-1',
    title: 'Morning yoga',
    bucket_type: 'personal' as const,
    item_type: 'habit' as const,
    reward: 10,
    assignee: 'me' as const,
    priority: 'low' as const,
    frequency: 'daily' as const,
    completed: false,
    archived: false,
    created_at: daysAgo(5),
  },
  {
    item_id: 'task-5',
    user_id: 'demo-user-1',
    title: 'Plan Saturday date night',
    bucket_type: 'joint' as const,
    item_type: 'task' as const,
    reward: 25,
    assignee: 'me' as const,
    priority: 'medium' as const,
    frequency: 'once' as const,
    completed: false,
    archived: false,
    created_at: daysAgo(1),
  },
];

// ── Mock All Items (includes completed for archive) ────────────

export const mockCompletedItems = [
  {
    item_id: 'done-1',
    user_id: 'demo-user-1',
    title: 'Check design theme for Replit.',
    bucket_type: 'personal' as const,
    item_type: 'task' as const,
    reward: 10,
    assignee: 'me' as const,
    priority: 'medium' as const,
    frequency: 'once' as const,
    completed: true,
    completed_by: 'demo-user-1',
    completed_at: new Date(2026, 0, 4, 14, 30).toISOString(),
    archived: false,
    created_at: daysAgo(10),
  },
  {
    item_id: 'done-2',
    user_id: 'demo-user-1',
    title: 'Wash the car!',
    bucket_type: 'joint' as const,
    item_type: 'task' as const,
    reward: 10,
    assignee: 'anyone' as const,
    priority: 'medium' as const,
    frequency: 'once' as const,
    completed: true,
    completed_by: 'demo-partner-1',
    completed_at: new Date(2026, 0, 4, 11, 15).toISOString(),
    archived: false,
    created_at: daysAgo(12),
  },
  {
    item_id: 'done-3',
    user_id: 'demo-user-1',
    title: 'Buy groceries for taco night',
    bucket_type: 'joint' as const,
    item_type: 'task' as const,
    reward: 10,
    assignee: 'me' as const,
    priority: 'high' as const,
    frequency: 'once' as const,
    completed: true,
    completed_by: 'demo-user-1',
    completed_at: new Date(2026, 0, 4, 9, 0).toISOString(),
    archived: false,
    created_at: daysAgo(8),
  },
  {
    item_id: 'done-4',
    user_id: 'demo-user-1',
    title: 'Test Replit',
    bucket_type: 'joint' as const,
    item_type: 'task' as const,
    reward: 10,
    assignee: 'anyone' as const,
    priority: 'low' as const,
    frequency: 'once' as const,
    completed: true,
    completed_by: 'demo-user-1',
    completed_at: new Date(2026, 0, 4, 8, 45).toISOString(),
    archived: false,
    created_at: daysAgo(6),
  },
  {
    item_id: 'done-5',
    user_id: 'demo-user-1',
    title: 'Morning coffee routine',
    bucket_type: 'personal' as const,
    item_type: 'habit' as const,
    reward: 5,
    assignee: 'me' as const,
    priority: 'low' as const,
    frequency: 'daily' as const,
    completed: true,
    completed_by: 'demo-user-1',
    completed_at: new Date(2026, 0, 3, 7, 30).toISOString(),
    archived: false,
    created_at: daysAgo(20),
  },
];

export const mockAllItems = [...mockPriorities, ...mockCompletedItems];

// ── Mock Rewards ───────────────────────────────────────────────

export const mockRewards = [
  {
    reward_id: 'reward-1',
    user_id: 'demo-user-1',
    title: 'Weekend Getaway Fund',
    cost: 1000,
    reward_type: 'joint' as const,
    icon: '✈️',
    is_goal: true,
    redeemed: false,
    created_at: daysAgo(30),
  },
  {
    reward_id: 'reward-2',
    user_id: 'demo-user-1',
    title: 'Movie Night Pick',
    cost: 50,
    reward_type: 'joint' as const,
    icon: '🎬',
    is_goal: false,
    redeemed: false,
    created_at: daysAgo(15),
  },
  {
    reward_id: 'reward-3',
    user_id: 'demo-user-1',
    title: 'Gaming Day - FC 26',
    cost: 50,
    reward_type: 'personal' as const,
    icon: '🍦',
    is_goal: false,
    redeemed: false,
    created_at: daysAgo(10),
  },
  {
    reward_id: 'reward-4',
    user_id: 'demo-user-1',
    title: 'New Book',
    cost: 75,
    reward_type: 'personal' as const,
    icon: '📚',
    is_goal: false,
    redeemed: false,
    created_at: daysAgo(7),
  },
];

// ── Mock AI Content ────────────────────────────────────────────

export const mockAIInsight =
  "Looks like a busy day for Kaushik. Margaux, maybe you can pick up the groceries from the \"Us\" list?";

export const mockAIInsightStore =
  "You're 45% of the way to your Weekend Getaway Fund! Complete 3 more high-reward tasks this week to unlock it.";

export const mockDailyPlan = [
  '[Morning] Start with your 10-minute yoga routine to set an energized tone for the day',
  '[9:00 AM] Tackle the budget review for the weekend trip while your focus is fresh',
  '[Lunch] Quick grocery run for taco night - Margaux can help with the list',
  '[Afternoon] Schedule that dentist appointment you keep putting off',
  '[Evening] Plan Saturday date night with Margaux - surprise her with something special',
];

export const mockCalendarStatus = {
  connected: false,
  provider: null,
  email: null,
};

export const mockCalendarEvents: Array<{
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
}> = [];

// ── Mock AI Chat Response ──────────────────────────────────────

export function mockChatResponse(message: string): { response: string; conversationId: string } {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('date') || lowerMsg.includes('romantic')) {
    return {
      response:
        "How about a cozy evening at home? Cook something new together from a cuisine you've never tried, light some candles, and put on your favorite playlist. Or if you want to go out, check out that new rooftop spot downtown - the views are stunning at sunset! 💕",
      conversationId: 'demo-conv-1',
    };
  }

  if (lowerMsg.includes('conflict') || lowerMsg.includes('fight') || lowerMsg.includes('argue')) {
    return {
      response:
        "I hear you. Small tensions are normal. Try this: schedule 15 minutes tonight where you each share one thing you appreciated about the other today. It's a simple practice that builds connection. Remember, you're on the same team.",
      conversationId: 'demo-conv-1',
    };
  }

  if (lowerMsg.includes('task') || lowerMsg.includes('busy') || lowerMsg.includes('overwhelm')) {
    return {
      response:
        "You've got 4 pending tasks on your personal list. Let me suggest a priority order: 1) Review budget (high priority, time-sensitive), 2) Grocery run (Margaux could help), 3) Dentist appointment. The yoga can wait until tomorrow morning!",
      conversationId: 'demo-conv-1',
    };
  }

  return {
    response:
      "That's a great question! I'm here to help with task prioritization, conflict resolution, date ideas, and productivity coaching. What would you like to dive into?",
    conversationId: 'demo-conv-1',
  };
}
