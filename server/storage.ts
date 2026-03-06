import {
  users,
  moodEntries,
  journalEntries,
  resources,
  completedResources,
  goals,
  type User,
  type InsertUser,
  type MoodEntry,
  type InsertMoodEntry,
  type JournalEntry,
  type InsertJournalEntry,
  type Resource,
  type InsertResource,
  type CompletedResource,
  type InsertCompletedResource,
  type Goal,
  type InsertGoal,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  // Mood Entries
  getMoodEntries(userId: string): Promise<MoodEntry[]>;
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;

  // Journal Entries
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;

  // Resources
  getAllResources(): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;

  // Completed Resources
  getCompletedResources(userId: string): Promise<CompletedResource[]>;
  createCompletedResource(data: InsertCompletedResource): Promise<CompletedResource>;
  deleteCompletedResource(id: string): Promise<void>;

  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, data: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Mood Entries
  async getMoodEntries(userId: string): Promise<MoodEntry[]> {
    return await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.createdAt));
  }

  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const [moodEntry] = await db
      .insert(moodEntries)
      .values(entry)
      .returning();
    return moodEntry;
  }

  // Journal Entries
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [journalEntry] = await db
      .insert(journalEntries)
      .values(entry)
      .returning();
    return journalEntry;
  }

  // Resources
  async getAllResources(): Promise<Resource[]> {
    return await db
      .select()
      .from(resources)
      .orderBy(desc(resources.createdAt));
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db
      .insert(resources)
      .values(resource)
      .returning();
    return newResource;
  }

  // Completed Resources
  async getCompletedResources(userId: string): Promise<CompletedResource[]> {
    return await db
      .select()
      .from(completedResources)
      .where(eq(completedResources.userId, userId))
      .orderBy(desc(completedResources.completedAt));
  }

  async createCompletedResource(data: InsertCompletedResource): Promise<CompletedResource> {
    const [completed] = await db
      .insert(completedResources)
      .values(data)
      .returning();
    return completed;
  }

  async deleteCompletedResource(id: string): Promise<void> {
    await db
      .delete(completedResources)
      .where(eq(completedResources.id, id));
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db
      .insert(goals)
      .values(goal)
      .returning();
    return newGoal;
  }

  async updateGoal(id: string, data: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [goal] = await db
      .update(goals)
      .set(data)
      .where(eq(goals.id, id))
      .returning();
    return goal || undefined;
  }

  async deleteGoal(id: string): Promise<void> {
    await db
      .delete(goals)
      .where(eq(goals.id, id));
  }
}

export const storage = new DatabaseStorage();
