// Bucket Keeper - Task & Bucket Store
// Local-first: writes to SQLite, then syncs to backend

import { create } from 'zustand';
import type { Task, Bucket, BucketType, Priority, ItemType, Frequency, Assignee, TaskCategory } from '../types';
import { TaskRepo, BucketRepo } from '../database/repositories';
import { itemsApi } from '../utils/api';

interface CreateTaskInput {
  title: string;
  bucketId: string;
  householdId: string;
  assignee: Assignee;
  isJoint: boolean;
  itemType: ItemType;
  priority: Priority;
  category: TaskCategory;
  reward: number;
  frequency: Frequency;
  dateMs: number | null;
  timeMs: number | null;
  isRecurring: boolean;
  recurringPattern: string | null;
}

interface CreateBucketInput {
  householdId: string;
  name: string;
  color: string;
  isJoint: boolean;
  icon: string;
}

interface TaskFilters {
  bucketType?: BucketType;
  isComplete?: boolean;
  archived?: boolean;
  bucketId?: string;
}

interface TaskState {
  tasks: Task[];
  buckets: Bucket[];
  isLoading: boolean;

  loadTasks: (filters?: TaskFilters) => Promise<void>;
  loadBuckets: (filters?: { isJoint?: boolean }) => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  completeTask: (taskId: string, userId: string) => Promise<void>;
  archiveTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createBucket: (input: CreateBucketInput) => Promise<Bucket>;
  deleteBucket: (bucketId: string) => Promise<void>;
  getCompletedTasks: () => Promise<Task[]>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  buckets: [],
  isLoading: false,

  loadTasks: async (filters) => {
    set({ isLoading: true });
    try {
      let tasks: Task[];

      if (filters?.bucketId) {
        tasks = await TaskRepo.getByBucket(filters.bucketId);
      } else if (filters?.isComplete) {
        tasks = await TaskRepo.getCompleted();
      } else {
        tasks = await TaskRepo.getAll(filters);
      }

      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      set({ isLoading: false });
    }
  },

  loadBuckets: async (filters) => {
    try {
      const buckets = await BucketRepo.getAll(filters);
      set({ buckets });
    } catch (error) {
      console.error('Failed to load buckets:', error);
    }
  },

  createTask: async (input) => {
    // Write to SQLite first
    const task = await TaskRepo.create({
      ...input,
      assignedToUserId: null,
      completedAt: null,
      completedBy: null,
      calendarEventId: null,
      focusTimeMs: 0,
      archived: false,
      isComplete: false,
    });

    // Update local state
    set((state) => ({ tasks: [task, ...state.tasks] }));

    // Background sync to backend (fire and forget)
    syncTaskToBackend(task);

    return task;
  },

  completeTask: async (taskId, userId) => {
    await TaskRepo.markComplete(taskId, userId);

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, isComplete: true, completedAt: Date.now(), completedBy: userId }
          : t,
      ),
    }));

    // Sync to backend
    try {
      await itemsApi.complete(taskId);
    } catch {
      // Will retry on next sync
    }
  },

  archiveTask: async (taskId) => {
    await TaskRepo.archive(taskId);

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, archived: true } : t,
      ),
    }));

    try {
      await itemsApi.archive(taskId);
    } catch {
      // Will retry on next sync
    }
  },

  deleteTask: async (taskId) => {
    await TaskRepo.deleteTask(taskId);

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));

    try {
      await itemsApi.delete(taskId);
    } catch {
      // Will retry on next sync
    }
  },

  createBucket: async (input) => {
    const bucket = await BucketRepo.create({
      ...input,
      isShared: input.isJoint,
      ownerId: null,
    });

    set((state) => ({ buckets: [...state.buckets, bucket] }));
    return bucket;
  },

  deleteBucket: async (bucketId) => {
    await BucketRepo.deleteBucket(bucketId);
    set((state) => ({
      buckets: state.buckets.filter((b) => b.id !== bucketId),
    }));
  },

  getCompletedTasks: async () => {
    return TaskRepo.getCompleted();
  },
}));

// ── Background Sync ────────────────────────────────────────────

async function syncTaskToBackend(task: Task): Promise<void> {
  try {
    await itemsApi.create({
      item_id: task.id,
      title: task.title,
      bucket_type: task.isJoint ? 'joint' : 'personal',
      item_type: task.itemType,
      reward: task.reward,
      assignee: task.assignee,
      priority: task.priority as any,
      frequency: task.frequency,
    });
  } catch (error) {
    // Task will be synced on next push
    console.warn('Background sync failed for task:', task.id);
  }
}
