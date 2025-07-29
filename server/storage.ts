import { users, otpCodes, pendingUsers, type User, type InsertUser, type InsertOtp, type OtpCode, type PendingUser, type InsertPendingUser } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAdminUser(user: Omit<InsertUser, 'email'> & { email: string }): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserProfile(userId: number, degreeProgram: string, subjects: string[]): Promise<User | undefined>;
  
  // Pending user operations
  createPendingUser(user: InsertPendingUser): Promise<PendingUser>;
  getPendingUserByEmail(email: string): Promise<PendingUser | undefined>;
  deletePendingUser(email: string): Promise<void>;
  
  // OTP operations
  createOtpCode(otp: InsertOtp): Promise<OtpCode>;
  getValidOtpCode(email: string, code: string): Promise<OtpCode | undefined>;
  checkOtpCodeValidity(email: string, code: string): Promise<OtpCode | undefined>;
  markOtpAsUsed(id: number): Promise<void>;
  cleanupExpiredOtps(): Promise<void>;
}

// Create and export the appropriate storage based on configuration
import { config } from './config';
import { MongoDBStorage } from './mongodb';
import { JsonStorage } from './json_storage';

let storage: IStorage;

// Initialize storage with MongoDB if configured, with fallback to JsonStorage
if (config.USE_MONGODB && config.MONGODB_URI) {
  const jsonStorage = new JsonStorage(); // Create fallback storage
  storage = new MongoDBStorage(jsonStorage);
  console.log('Using MongoDB storage with JsonStorage fallback');
} else {
  storage = new JsonStorage();
  console.log('Using JsonStorage (no MongoDB configured)');
}

export { storage };
