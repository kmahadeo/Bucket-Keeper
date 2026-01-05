import { storage } from "../storage";
import type { BucketItem, Reward, User } from "@shared/schema";

export interface AICoupleContext {
  user: {
    name: string;
    mood: string | null;
    personalCoins: number;
    jointCoins: number;
  };
  partner: {
    name: string;
    mood: string | null;
  } | null;
  buckets: {
    personal: { pending: BucketItem[]; completed: BucketItem[]; overdue: BucketItem[] };
    partner: { pending: BucketItem[]; completed: BucketItem[]; overdue: BucketItem[] };
    joint: { pending: BucketItem[]; completed: BucketItem[]; overdue: BucketItem[] };
  };
  stats: {
    totalCompleted: number;
    completedThisWeek: number;
    pendingCount: number;
    overdueCount: number;
    averageCoinsEarned: number;
    streakDays: number;
  };
  rewards: {
    available: Reward[];
    affordable: Reward[];
  };
  patterns: {
    mostProductiveDay: string | null;
    commonTaskTypes: string[];
    balanceScore: number;
  };
}

export async function buildCoupleContext(userId: string): Promise<AICoupleContext> {
  const user = await storage.getUser(userId);
  const partnerUser = user?.partnerId ? await storage.getUser(user.partnerId) : null;
  
  const userItems = await storage.getAllItems(userId);
  const partnerItems = partnerUser ? await storage.getAllItems(partnerUser.id) : [];
  const allItems = [...userItems, ...partnerItems].filter((item, index, arr) => 
    arr.findIndex(i => i.id === item.id) === index
  );
  
  const globalRewards = await storage.getAllRewards();
  const allRewards = globalRewards.filter(r => !r.userId || r.userId === userId || r.userId === partnerUser?.id);
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const categorizeItems = (items: BucketItem[], bucket: string) => {
    const bucketItems = items.filter(i => i.bucket === bucket);
    const pending = bucketItems.filter(i => !i.completed);
    const completed = bucketItems.filter(i => i.completed);
    const overdue = pending.filter(i => i.dueDate && new Date(i.dueDate) < now);
    return { pending, completed, overdue };
  };
  
  const completedItems = allItems.filter(i => i.completed);
  const completedThisWeek = completedItems.filter(i => 
    i.completedAt && new Date(i.completedAt) >= weekAgo
  );
  const pendingItems = allItems.filter(i => !i.completed);
  const overdueItems = pendingItems.filter(i => i.dueDate && new Date(i.dueDate) < now);
  
  const taskTypes = allItems.map(i => i.type);
  const typeCount: Record<string, number> = {};
  taskTypes.forEach(t => { typeCount[t] = (typeCount[t] || 0) + 1; });
  const commonTaskTypes = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);
  
  const userCompleted = completedItems.filter(i => i.ownerId === userId || i.assigneeId === userId).length;
  const partnerCompleted = partnerUser ? completedItems.filter(i => 
    i.ownerId === partnerUser.id || i.assigneeId === partnerUser.id
  ).length : 0;
  const total = userCompleted + partnerCompleted;
  const balanceScore = total > 0 ? Math.round((Math.min(userCompleted, partnerCompleted) / Math.max(userCompleted, partnerCompleted, 1)) * 100) : 100;
  
  const totalCoins = user ? user.personalCoins + user.jointCoins : 0;
  const affordableRewards = allRewards.filter(r => r.cost <= totalCoins);

  return {
    user: {
      name: user?.name || "User",
      mood: user?.mood || null,
      personalCoins: user?.personalCoins || 0,
      jointCoins: user?.jointCoins || 0,
    },
    partner: partnerUser ? {
      name: partnerUser.name,
      mood: partnerUser.mood || null,
    } : null,
    buckets: {
      personal: categorizeItems(allItems, 'personal'),
      partner: categorizeItems(allItems, 'partner'),
      joint: categorizeItems(allItems, 'joint'),
    },
    stats: {
      totalCompleted: completedItems.length,
      completedThisWeek: completedThisWeek.length,
      pendingCount: pendingItems.length,
      overdueCount: overdueItems.length,
      averageCoinsEarned: completedItems.length > 0 
        ? Math.round(completedItems.reduce((sum, i) => sum + i.coinsReward, 0) / completedItems.length)
        : 0,
      streakDays: calculateStreak(completedItems),
    },
    rewards: {
      available: allRewards,
      affordable: affordableRewards,
    },
    patterns: {
      mostProductiveDay: getMostProductiveDay(completedItems),
      commonTaskTypes,
      balanceScore,
    },
  };
}

function calculateStreak(completedItems: BucketItem[]): number {
  if (completedItems.length === 0) return 0;
  
  const dates = completedItems
    .filter(i => i.completedAt)
    .map(i => new Date(i.completedAt!).toDateString())
    .filter((date, i, arr) => arr.indexOf(date) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (dates.length === 0) return 0;
  
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  
  let checkDate = new Date(dates[0]);
  for (const dateStr of dates) {
    if (new Date(dateStr).toDateString() === checkDate.toDateString()) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }
  
  return streak;
}

function getMostProductiveDay(completedItems: BucketItem[]): string | null {
  if (completedItems.length === 0) return null;
  
  const dayCount: Record<string, number> = {};
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  completedItems.forEach(item => {
    if (item.completedAt) {
      const day = days[new Date(item.completedAt).getDay()];
      dayCount[day] = (dayCount[day] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(dayCount).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}

export function formatContextForPrompt(ctx: AICoupleContext, scope: string): string {
  const parts: string[] = [];
  
  parts.push(`=== COUPLE CONTEXT ===`);
  parts.push(`User: ${ctx.user.name} (Mood: ${ctx.user.mood || 'unknown'}, Coins: ${ctx.user.personalCoins} personal, ${ctx.user.jointCoins} joint)`);
  if (ctx.partner) {
    parts.push(`Partner: ${ctx.partner.name} (Mood: ${ctx.partner.mood || 'unknown'})`);
  }
  
  parts.push(`\n=== CURRENT STATUS ===`);
  parts.push(`Pending tasks: ${ctx.stats.pendingCount}`);
  parts.push(`Overdue items: ${ctx.stats.overdueCount}`);
  parts.push(`Completed this week: ${ctx.stats.completedThisWeek}`);
  parts.push(`Total completed ever: ${ctx.stats.totalCompleted}`);
  parts.push(`Current streak: ${ctx.stats.streakDays} days`);
  
  if (scope === 'home' || scope === 'daily_plan') {
    parts.push(`\n=== TODAY'S PENDING ITEMS ===`);
    const allPending = [
      ...ctx.buckets.personal.pending,
      ...ctx.buckets.partner.pending,
      ...ctx.buckets.joint.pending,
    ].slice(0, 10);
    
    if (allPending.length > 0) {
      allPending.forEach(item => {
        const due = item.dueDate ? ` (Due: ${new Date(item.dueDate).toLocaleDateString()})` : '';
        const priority = item.priority ? ` [${item.priority}]` : '';
        parts.push(`- ${item.title} (${item.type}, ${item.bucket} bucket, ${item.coinsReward} coins)${priority}${due}`);
      });
    } else {
      parts.push(`No pending items - great job!`);
    }
    
    if (ctx.buckets.joint.overdue.length > 0 || ctx.buckets.personal.overdue.length > 0) {
      parts.push(`\n=== OVERDUE ITEMS (URGENT) ===`);
      [...ctx.buckets.personal.overdue, ...ctx.buckets.joint.overdue].forEach(item => {
        parts.push(`- ${item.title} (${item.type}, ${item.bucket} bucket) - OVERDUE!`);
      });
    }
  }
  
  if (scope === 'buckets' || scope === 'balance') {
    parts.push(`\n=== BUCKET BREAKDOWN ===`);
    parts.push(`Personal: ${ctx.buckets.personal.pending.length} pending, ${ctx.buckets.personal.completed.length} done`);
    parts.push(`Partner: ${ctx.buckets.partner.pending.length} pending, ${ctx.buckets.partner.completed.length} done`);
    parts.push(`Joint: ${ctx.buckets.joint.pending.length} pending, ${ctx.buckets.joint.completed.length} done`);
    parts.push(`\nWorkload Balance Score: ${ctx.patterns.balanceScore}%`);
  }
  
  if (scope === 'store' || scope === 'rewards') {
    parts.push(`\n=== REWARDS ===`);
    parts.push(`Total coins available: ${ctx.user.personalCoins + ctx.user.jointCoins}`);
    parts.push(`Affordable rewards: ${ctx.rewards.affordable.length} of ${ctx.rewards.available.length}`);
    if (ctx.rewards.affordable.length > 0) {
      parts.push(`Can redeem:`);
      ctx.rewards.affordable.slice(0, 5).forEach(r => {
        parts.push(`- ${r.title} (${r.cost} coins)`);
      });
    }
  }
  
  parts.push(`\n=== PATTERNS ===`);
  parts.push(`Most productive day: ${ctx.patterns.mostProductiveDay || 'Not enough data'}`);
  parts.push(`Common task types: ${ctx.patterns.commonTaskTypes.join(', ') || 'None yet'}`);
  
  return parts.join('\n');
}
