// Bucket Keeper - AI Context Builder
// Aggregates real user data into structured context for AI prompts

import type { AIContext, AIContextScope, Task, AuthUser } from '../types';
import { TaskRepo, BucketRepo } from '../database/repositories';

interface ContextInput {
  user: AuthUser;
  partnerName?: string | null;
  partnerMood?: string | null;
}

export async function buildCoupleContext(
  scope: AIContextScope,
  input: ContextInput,
): Promise<AIContext> {
  const { user, partnerName, partnerMood } = input;

  // Fetch task data from local SQLite
  const allTasks = await TaskRepo.getAll();
  const completedTasks = await TaskRepo.getCompleted();

  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  // Calculate task metrics
  const pendingTasks = allTasks.filter((t) => !t.isComplete && !t.archived);
  const completedToday = completedTasks.filter(
    (t) => t.completedAt && t.completedAt >= todayMs,
  );
  const overdueTasks = pendingTasks.filter(
    (t) => t.dateMs && t.dateMs < now,
  );
  const highPriorityTasks = pendingTasks.filter(
    (t) => t.priority === 'high' || t.priority === 'urgent',
  );

  // Calculate productivity patterns
  const streak = calculateCompletionStreak(completedTasks);
  const weeklyAvg = calculateWeeklyAverage(completedTasks);
  const balanceScore = calculatePartnerBalance(allTasks, user.user_id);

  return {
    scope,
    user: {
      name: user.name,
      mood: user.mood ?? null,
      coinsJoint: user.coins_joint,
      coinsPersonal: user.coins_personal,
    },
    partner: partnerName
      ? { name: partnerName, mood: partnerMood ?? null }
      : null,
    tasks: {
      pendingCount: pendingTasks.length,
      completedTodayCount: completedToday.length,
      overdueCount: overdueTasks.length,
      highPriorityCount: highPriorityTasks.length,
    },
    patterns: {
      completionStreak: streak,
      weeklyAverage: weeklyAvg,
      partnerBalanceScore: balanceScore,
    },
    rewards: {
      availableCount: 0, // Will be filled by caller if needed
      totalCoinsEarned: user.coins_joint + user.coins_personal,
    },
  };
}

function calculateCompletionStreak(completedTasks: Task[]): number {
  if (completedTasks.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dayStart = checkDate.getTime();
    const dayEnd = dayStart + 86400000;

    const hasCompletion = completedTasks.some(
      (t) => t.completedAt && t.completedAt >= dayStart && t.completedAt < dayEnd,
    );

    if (hasCompletion) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      // Today might not have completions yet, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    } else {
      break;
    }
  }

  return streak;
}

function calculateWeeklyAverage(completedTasks: Task[]): number {
  if (completedTasks.length === 0) return 0;

  const fourWeeksAgo = Date.now() - 28 * 86400000;
  const recentCompletions = completedTasks.filter(
    (t) => t.completedAt && t.completedAt >= fourWeeksAgo,
  );

  return Math.round((recentCompletions.length / 4) * 10) / 10;
}

function calculatePartnerBalance(tasks: Task[], userId: string): number {
  // Score from -1 to 1
  // Negative means current user does more, positive means partner does more
  const completedWithAssignee = tasks.filter(
    (t) => t.isComplete && t.assignedToUserId,
  );

  if (completedWithAssignee.length === 0) return 0;

  const myCompletions = completedWithAssignee.filter(
    (t) => t.assignedToUserId === userId,
  ).length;
  const partnerCompletions = completedWithAssignee.length - myCompletions;
  const total = myCompletions + partnerCompletions;

  if (total === 0) return 0;
  return Math.round(((partnerCompletions - myCompletions) / total) * 100) / 100;
}

// Format context for AI prompt consumption
export function formatContextForPrompt(context: AIContext): string {
  const lines: string[] = [];

  lines.push(`User: ${context.user.name} (mood: ${context.user.mood || 'not set'})`);
  lines.push(`Coins: ${context.user.coinsJoint} joint, ${context.user.coinsPersonal} personal`);

  if (context.partner) {
    lines.push(`Partner: ${context.partner.name} (mood: ${context.partner.mood || 'not set'})`);
  }

  lines.push('');
  lines.push(`Tasks: ${context.tasks.pendingCount} pending, ${context.tasks.completedTodayCount} done today`);

  if (context.tasks.overdueCount > 0) {
    lines.push(`Overdue: ${context.tasks.overdueCount} tasks`);
  }
  if (context.tasks.highPriorityCount > 0) {
    lines.push(`High priority: ${context.tasks.highPriorityCount} tasks`);
  }

  lines.push('');
  lines.push(`Streak: ${context.patterns.completionStreak} days`);
  lines.push(`Weekly average: ${context.patterns.weeklyAverage} tasks/week`);

  if (context.partner) {
    const balance = context.patterns.partnerBalanceScore;
    if (balance < -0.2) {
      lines.push(`Workload: ${context.user.name} is doing significantly more tasks`);
    } else if (balance > 0.2) {
      lines.push(`Workload: ${context.partner.name} is doing significantly more tasks`);
    } else {
      lines.push('Workload: fairly balanced between partners');
    }
  }

  return lines.join('\n');
}
