import { type User, type InsertUser, type BucketItem, type InsertBucketItem, type Reward, type InsertReward, users, bucketItems, rewards } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoins(userId: string, personalCoins?: number, jointCoins?: number): Promise<User>;
  updateUserMood(userId: string, mood: string): Promise<User>;
  
  // Bucket Item operations
  getAllItems(userId?: string): Promise<BucketItem[]>;
  getItemById(id: string): Promise<BucketItem | undefined>;
  createItem(item: InsertBucketItem): Promise<BucketItem>;
  updateItem(id: string, updates: Partial<InsertBucketItem>): Promise<BucketItem>;
  deleteItem(id: string): Promise<void>;
  toggleItemComplete(id: string): Promise<BucketItem>;
  
  // Reward operations
  getAllRewards(userId?: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  deleteReward(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // --- User Operations ---
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserCoins(userId: string, personalCoins?: number, jointCoins?: number): Promise<User> {
    const updates: any = {};
    if (personalCoins !== undefined) updates.personalCoins = personalCoins;
    if (jointCoins !== undefined) updates.jointCoins = jointCoins;
    
    const [user] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
    return user;
  }

  async updateUserMood(userId: string, mood: string): Promise<User> {
    const [user] = await db.update(users).set({ mood }).where(eq(users.id, userId)).returning();
    return user;
  }

  // --- Bucket Item Operations ---
  async getAllItems(userId?: string): Promise<BucketItem[]> {
    if (userId) {
      return db.select().from(bucketItems).where(
        eq(bucketItems.ownerId, userId)
      );
    }
    return db.select().from(bucketItems);
  }

  async getItemById(id: string): Promise<BucketItem | undefined> {
    const [item] = await db.select().from(bucketItems).where(eq(bucketItems.id, id));
    return item;
  }

  async createItem(item: InsertBucketItem): Promise<BucketItem> {
    const [newItem] = await db.insert(bucketItems).values(item).returning();
    return newItem;
  }

  async updateItem(id: string, updates: Partial<InsertBucketItem>): Promise<BucketItem> {
    const [item] = await db.update(bucketItems).set(updates).where(eq(bucketItems.id, id)).returning();
    return item;
  }

  async deleteItem(id: string): Promise<void> {
    await db.delete(bucketItems).where(eq(bucketItems.id, id));
  }

  async toggleItemComplete(id: string): Promise<BucketItem> {
    const item = await this.getItemById(id);
    if (!item) throw new Error("Item not found");
    
    const updates: any = {
      completed: !item.completed,
    };
    
    if (!item.completed) {
      updates.completedAt = new Date();
    } else {
      updates.completedAt = null;
    }
    
    const [updatedItem] = await db.update(bucketItems).set(updates).where(eq(bucketItems.id, id)).returning();
    return updatedItem;
  }

  // --- Reward Operations ---
  async getAllRewards(userId?: string): Promise<Reward[]> {
    if (userId) {
      return db.select().from(rewards).where(eq(rewards.userId, userId));
    }
    return db.select().from(rewards);
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db.insert(rewards).values(reward).returning();
    return newReward;
  }

  async deleteReward(id: string): Promise<void> {
    await db.delete(rewards).where(eq(rewards.id, id));
  }
}

export const storage = new DatabaseStorage();
