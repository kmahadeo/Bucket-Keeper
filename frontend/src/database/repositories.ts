// Bucket Keeper - Repository Functions

import { getDatabase, generateId } from './database';
import type { SQLiteBindValue } from 'expo-sqlite';
import type {
  Household,
  User,
  Bucket,
  Task,
  FocusSession,
  Conversation,
  Message,
} from '../types/index';

// ── Row Mapping Helpers ───────────────────────────────────────────
// SQLite stores booleans as 0/1 integers. These helpers convert between
// the DB row shape and the TypeScript interfaces.

function mapTask(row: Record<string, unknown>): Task {
  return {
    ...(row as unknown as Task),
    isJoint: Boolean(row.isJoint),
    isRecurring: Boolean(row.isRecurring),
    isComplete: Boolean(row.isComplete),
    archived: Boolean(row.archived),
  };
}

function mapBucket(row: Record<string, unknown>): Bucket {
  return {
    ...(row as unknown as Bucket),
    isJoint: Boolean(row.isJoint),
    isShared: Boolean(row.isShared),
  };
}

function mapUser(row: Record<string, unknown>): User {
  return {
    ...(row as unknown as User),
    isCurrentUser: Boolean(row.isCurrentUser),
  };
}

// ── TaskRepo ──────────────────────────────────────────────────────

export interface TaskFilters {
  householdId?: string;
  bucketId?: string;
  assignedToUserId?: string;
  isComplete?: boolean;
  archived?: boolean;
  priority?: string;
  itemType?: string;
}

function buildTaskWhereClause(filters?: TaskFilters): {
  clause: string;
  params: SQLiteBindValue[];
} {
  if (!filters) return { clause: '', params: [] };
  const conditions: string[] = [];
  const params: SQLiteBindValue[] = [];

  if (filters.householdId !== undefined) {
    conditions.push('householdId = ?');
    params.push(filters.householdId);
  }
  if (filters.bucketId !== undefined) {
    conditions.push('bucketId = ?');
    params.push(filters.bucketId);
  }
  if (filters.assignedToUserId !== undefined) {
    conditions.push('assignedToUserId = ?');
    params.push(filters.assignedToUserId);
  }
  if (filters.isComplete !== undefined) {
    conditions.push('isComplete = ?');
    params.push(filters.isComplete ? 1 : 0);
  }
  if (filters.archived !== undefined) {
    conditions.push('archived = ?');
    params.push(filters.archived ? 1 : 0);
  }
  if (filters.priority !== undefined) {
    conditions.push('priority = ?');
    params.push(filters.priority);
  }
  if (filters.itemType !== undefined) {
    conditions.push('itemType = ?');
    params.push(filters.itemType);
  }

  const clause =
    conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
  return { clause, params };
}

export const TaskRepo = {
  getAll(filters?: TaskFilters): Task[] {
    const db = getDatabase();
    const { clause, params } = buildTaskWhereClause(filters);
    const rows = db.getAllSync<Record<string, unknown>>(
      `SELECT * FROM tasks${clause} ORDER BY createdAt DESC;`,
      ...params
    );
    return rows.map(mapTask);
  },

  getById(id: string): Task | null {
    const db = getDatabase();
    const row = db.getFirstSync<Record<string, unknown>>(
      'SELECT * FROM tasks WHERE id = ?;',
      id
    );
    return row ? mapTask(row) : null;
  },

  getByBucket(bucketId: string): Task[] {
    const db = getDatabase();
    const rows = db.getAllSync<Record<string, unknown>>(
      'SELECT * FROM tasks WHERE bucketId = ? AND archived = 0 ORDER BY createdAt DESC;',
      bucketId
    );
    return rows.map(mapTask);
  },

  getByDate(dateMs: number): Task[] {
    const db = getDatabase();
    const rows = db.getAllSync<Record<string, unknown>>(
      'SELECT * FROM tasks WHERE dateMs = ? AND archived = 0 ORDER BY timeMs ASC;',
      dateMs
    );
    return rows.map(mapTask);
  },

  getCompleted(): Task[] {
    const db = getDatabase();
    const rows = db.getAllSync<Record<string, unknown>>(
      'SELECT * FROM tasks WHERE isComplete = 1 ORDER BY completedAt DESC;'
    );
    return rows.map(mapTask);
  },

  create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const db = getDatabase();
    const id = generateId();
    const now = Date.now();
    db.runSync(
      `INSERT INTO tasks (
        id, bucketId, householdId, title, assignedToUserId, assignee,
        isJoint, itemType, priority, category, reward, dateMs, timeMs,
        isRecurring, recurringPattern, frequency, isComplete, completedAt,
        completedBy, calendarEventId, focusTimeMs, archived, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      id,
      data.bucketId,
      data.householdId,
      data.title,
      data.assignedToUserId,
      data.assignee,
      data.isJoint ? 1 : 0,
      data.itemType,
      data.priority,
      data.category,
      data.reward,
      data.dateMs,
      data.timeMs,
      data.isRecurring ? 1 : 0,
      data.recurringPattern,
      data.frequency,
      data.isComplete ? 1 : 0,
      data.completedAt,
      data.completedBy,
      data.calendarEventId,
      data.focusTimeMs,
      data.archived ? 1 : 0,
      now,
      now
    );
    return this.getById(id)!;
  },

  update(id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
    const db = getDatabase();
    const fields: string[] = [];
    const params: SQLiteBindValue[] = [];

    const booleanFields = new Set(['isJoint', 'isRecurring', 'isComplete', 'archived']);

    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || key === 'createdAt') continue;
      fields.push(`${key} = ?`);
      if (booleanFields.has(key)) {
        params.push(value ? 1 : 0);
      } else {
        params.push(value as SQLiteBindValue);
      }
    }

    if (fields.length === 0) return this.getById(id);

    // Always update updatedAt
    fields.push('updatedAt = ?');
    params.push(Date.now());
    params.push(id);

    db.runSync(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?;`,
      ...params
    );
    return this.getById(id);
  },

  markComplete(id: string, userId: string): Task | null {
    const db = getDatabase();
    const now = Date.now();
    db.runSync(
      `UPDATE tasks SET isComplete = 1, completedAt = ?, completedBy = ?, updatedAt = ? WHERE id = ?;`,
      now,
      userId,
      now,
      id
    );
    return this.getById(id);
  },

  archive(id: string): Task | null {
    const db = getDatabase();
    db.runSync(
      'UPDATE tasks SET archived = 1, updatedAt = ? WHERE id = ?;',
      Date.now(),
      id
    );
    return this.getById(id);
  },

  deleteTask(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM tasks WHERE id = ?;', id);
  },
};

// ── BucketRepo ────────────────────────────────────────────────────

export interface BucketFilters {
  householdId?: string;
  ownerId?: string;
  isJoint?: boolean;
  isShared?: boolean;
}

export const BucketRepo = {
  getAll(filters?: BucketFilters): Bucket[] {
    const db = getDatabase();
    const conditions: string[] = [];
    const params: SQLiteBindValue[] = [];

    if (filters) {
      if (filters.householdId !== undefined) {
        conditions.push('householdId = ?');
        params.push(filters.householdId);
      }
      if (filters.ownerId !== undefined) {
        conditions.push('ownerId = ?');
        params.push(filters.ownerId);
      }
      if (filters.isJoint !== undefined) {
        conditions.push('isJoint = ?');
        params.push(filters.isJoint ? 1 : 0);
      }
      if (filters.isShared !== undefined) {
        conditions.push('isShared = ?');
        params.push(filters.isShared ? 1 : 0);
      }
    }

    const clause =
      conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
    const rows = db.getAllSync<Record<string, unknown>>(
      `SELECT * FROM buckets${clause} ORDER BY createdAt DESC;`,
      ...params
    );
    return rows.map(mapBucket);
  },

  getById(id: string): Bucket | null {
    const db = getDatabase();
    const row = db.getFirstSync<Record<string, unknown>>(
      'SELECT * FROM buckets WHERE id = ?;',
      id
    );
    return row ? mapBucket(row) : null;
  },

  create(data: Omit<Bucket, 'id' | 'createdAt'>): Bucket {
    const db = getDatabase();
    const id = generateId();
    const now = Date.now();
    db.runSync(
      `INSERT INTO buckets (id, householdId, name, color, isJoint, isShared, ownerId, icon, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      id,
      data.householdId,
      data.name,
      data.color,
      data.isJoint ? 1 : 0,
      data.isShared ? 1 : 0,
      data.ownerId,
      data.icon,
      now
    );
    return this.getById(id)!;
  },

  update(id: string, data: Partial<Omit<Bucket, 'id' | 'createdAt'>>): Bucket | null {
    const db = getDatabase();
    const fields: string[] = [];
    const params: SQLiteBindValue[] = [];

    const booleanFields = new Set(['isJoint', 'isShared']);

    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || key === 'createdAt') continue;
      fields.push(`${key} = ?`);
      if (booleanFields.has(key)) {
        params.push(value ? 1 : 0);
      } else {
        params.push(value as SQLiteBindValue);
      }
    }

    if (fields.length === 0) return this.getById(id);

    params.push(id);
    db.runSync(
      `UPDATE buckets SET ${fields.join(', ')} WHERE id = ?;`,
      ...params
    );
    return this.getById(id);
  },

  deleteBucket(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM buckets WHERE id = ?;', id);
  },

  getTaskCount(id: string): number {
    const db = getDatabase();
    const row = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks WHERE bucketId = ? AND archived = 0;',
      id
    );
    return row?.count ?? 0;
  },

  getCompletedCount(id: string): number {
    const db = getDatabase();
    const row = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks WHERE bucketId = ? AND isComplete = 1;',
      id
    );
    return row?.count ?? 0;
  },
};

// ── HouseholdRepo ─────────────────────────────────────────────────

export const HouseholdRepo = {
  get(): Household | null {
    const db = getDatabase();
    const row = db.getFirstSync<Household>(
      'SELECT * FROM households LIMIT 1;'
    );
    return row ?? null;
  },

  create(data: Omit<Household, 'id' | 'createdAt'>): Household {
    const db = getDatabase();
    const id = generateId();
    const now = Date.now();
    db.runSync(
      'INSERT INTO households (id, name, inviteCode, createdAt) VALUES (?, ?, ?, ?);',
      id,
      data.name,
      data.inviteCode,
      now
    );
    return db.getFirstSync<Household>(
      'SELECT * FROM households WHERE id = ?;',
      id
    )!;
  },

  update(id: string, data: Partial<Omit<Household, 'id' | 'createdAt'>>): Household | null {
    const db = getDatabase();
    const fields: string[] = [];
    const params: SQLiteBindValue[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || key === 'createdAt') continue;
      fields.push(`${key} = ?`);
      params.push(value as SQLiteBindValue);
    }

    if (fields.length === 0) {
      return db.getFirstSync<Household>(
        'SELECT * FROM households WHERE id = ?;',
        id
      ) ?? null;
    }

    params.push(id);
    db.runSync(
      `UPDATE households SET ${fields.join(', ')} WHERE id = ?;`,
      ...params
    );
    return db.getFirstSync<Household>(
      'SELECT * FROM households WHERE id = ?;',
      id
    ) ?? null;
  },
};

// ── UserRepo ──────────────────────────────────────────────────────

export const UserRepo = {
  getAll(): User[] {
    const db = getDatabase();
    const rows = db.getAllSync<Record<string, unknown>>(
      'SELECT * FROM users ORDER BY createdAt ASC;'
    );
    return rows.map(mapUser);
  },

  getCurrentUser(): User | null {
    const db = getDatabase();
    const row = db.getFirstSync<Record<string, unknown>>(
      'SELECT * FROM users WHERE isCurrentUser = 1 LIMIT 1;'
    );
    return row ? mapUser(row) : null;
  },

  create(data: Omit<User, 'id' | 'createdAt'>): User {
    const db = getDatabase();
    const id = generateId();
    const now = Date.now();
    db.runSync(
      `INSERT INTO users (id, householdId, name, avatarColor, isCurrentUser, createdAt)
       VALUES (?, ?, ?, ?, ?, ?);`,
      id,
      data.householdId,
      data.name,
      data.avatarColor,
      data.isCurrentUser ? 1 : 0,
      now
    );
    const row = db.getFirstSync<Record<string, unknown>>(
      'SELECT * FROM users WHERE id = ?;',
      id
    );
    return mapUser(row!);
  },

  update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const db = getDatabase();
    const fields: string[] = [];
    const params: SQLiteBindValue[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || key === 'createdAt') continue;
      fields.push(`${key} = ?`);
      if (key === 'isCurrentUser') {
        params.push(value ? 1 : 0);
      } else {
        params.push(value as SQLiteBindValue);
      }
    }

    if (fields.length === 0) {
      const row = db.getFirstSync<Record<string, unknown>>(
        'SELECT * FROM users WHERE id = ?;',
        id
      );
      return row ? mapUser(row) : null;
    }

    params.push(id);
    db.runSync(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?;`,
      ...params
    );
    const row = db.getFirstSync<Record<string, unknown>>(
      'SELECT * FROM users WHERE id = ?;',
      id
    );
    return row ? mapUser(row) : null;
  },
};

// ── ConversationRepo ──────────────────────────────────────────────

export const ConversationRepo = {
  getAll(): Conversation[] {
    const db = getDatabase();
    return db.getAllSync<Conversation>(
      'SELECT * FROM conversations ORDER BY updatedAt DESC;'
    );
  },

  getById(id: string): Conversation | null {
    const db = getDatabase();
    return (
      db.getFirstSync<Conversation>(
        'SELECT * FROM conversations WHERE id = ?;',
        id
      ) ?? null
    );
  },

  create(data: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Conversation {
    const db = getDatabase();
    const id = generateId();
    const now = Date.now();
    db.runSync(
      'INSERT INTO conversations (id, userId, title, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?);',
      id,
      data.userId,
      data.title,
      now,
      now
    );
    return db.getFirstSync<Conversation>(
      'SELECT * FROM conversations WHERE id = ?;',
      id
    )!;
  },

  getMessages(conversationId: string): Message[] {
    const db = getDatabase();
    return db.getAllSync<Message>(
      'SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC;',
      conversationId
    );
  },

  addMessage(data: Omit<Message, 'id' | 'createdAt'>): Message {
    const db = getDatabase();
    const id = generateId();
    const now = Date.now();
    db.runSync(
      'INSERT INTO messages (id, conversationId, role, content, createdAt) VALUES (?, ?, ?, ?, ?);',
      id,
      data.conversationId,
      data.role,
      data.content,
      now
    );
    // Also update the conversation's updatedAt timestamp
    db.runSync(
      'UPDATE conversations SET updatedAt = ? WHERE id = ?;',
      now,
      data.conversationId
    );
    return db.getFirstSync<Message>(
      'SELECT * FROM messages WHERE id = ?;',
      id
    )!;
  },
};
