// Bucket Keeper - Database Schema & Migrations

export const CURRENT_VERSION = 1;

export interface Migration {
  version: number;
  up: string[];
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: [
      `CREATE TABLE IF NOT EXISTS households (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        inviteCode TEXT UNIQUE,
        createdAt INTEGER NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        householdId TEXT,
        name TEXT NOT NULL,
        avatarColor TEXT NOT NULL DEFAULT '#6366f1',
        isCurrentUser INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (householdId) REFERENCES households(id) ON DELETE SET NULL
      );`,

      `CREATE TABLE IF NOT EXISTS buckets (
        id TEXT PRIMARY KEY NOT NULL,
        householdId TEXT,
        name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#6366f1',
        isJoint INTEGER NOT NULL DEFAULT 0,
        isShared INTEGER NOT NULL DEFAULT 0,
        ownerId TEXT,
        icon TEXT DEFAULT '',
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (householdId) REFERENCES households(id) ON DELETE CASCADE,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE SET NULL
      );`,

      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        bucketId TEXT,
        householdId TEXT,
        title TEXT NOT NULL,
        assignedToUserId TEXT,
        assignee TEXT NOT NULL DEFAULT 'anyone',
        isJoint INTEGER NOT NULL DEFAULT 0,
        itemType TEXT NOT NULL DEFAULT 'task',
        priority TEXT NOT NULL DEFAULT 'medium',
        category TEXT NOT NULL DEFAULT '',
        reward INTEGER NOT NULL DEFAULT 10,
        dateMs INTEGER,
        timeMs INTEGER,
        isRecurring INTEGER NOT NULL DEFAULT 0,
        recurringPattern TEXT,
        frequency TEXT NOT NULL DEFAULT 'once',
        isComplete INTEGER NOT NULL DEFAULT 0,
        completedAt INTEGER,
        completedBy TEXT,
        calendarEventId TEXT,
        focusTimeMs INTEGER NOT NULL DEFAULT 0,
        archived INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (bucketId) REFERENCES buckets(id) ON DELETE CASCADE,
        FOREIGN KEY (householdId) REFERENCES households(id) ON DELETE CASCADE,
        FOREIGN KEY (assignedToUserId) REFERENCES users(id) ON DELETE SET NULL
      );`,

      `CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        taskId TEXT,
        userId TEXT,
        startedAt INTEGER NOT NULL,
        endedAt INTEGER,
        durationMs INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT,
        title TEXT NOT NULL DEFAULT '',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        conversationId TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
      );`,

      // Indexes for common query patterns
      `CREATE INDEX IF NOT EXISTS idx_users_householdId ON users(householdId);`,
      `CREATE INDEX IF NOT EXISTS idx_buckets_householdId ON buckets(householdId);`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_bucketId ON tasks(bucketId);`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_householdId ON tasks(householdId);`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_dateMs ON tasks(dateMs);`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_isComplete ON tasks(isComplete);`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived);`,
      `CREATE INDEX IF NOT EXISTS idx_focus_sessions_taskId ON focus_sessions(taskId);`,
      `CREATE INDEX IF NOT EXISTS idx_focus_sessions_userId ON focus_sessions(userId);`,
      `CREATE INDEX IF NOT EXISTS idx_messages_conversationId ON messages(conversationId);`,
    ],
  },
];
