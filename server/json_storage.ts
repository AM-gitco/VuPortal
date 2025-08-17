import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IStorage } from './storage';
import { InsertUser, InsertPendingUser, InsertOtp, User, PendingUser, OtpCode } from '@shared/schema';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, 'users.json');
const PENDING_USERS_FILE = path.join(__dirname, 'pending_users.json');
const OTP_CODES_FILE = path.join(__dirname, 'otp_codes.json');

export class JsonStorage implements IStorage {
  private users: User[] = [];
  private pendingUsers: PendingUser[] = [];
  private otpCodes: OtpCode[] = [];


  private constructor() {}

  public static async create(): Promise<JsonStorage> {
    const storage = new JsonStorage();
    await storage.loadData();
    await storage.initializeAdminUser();
    return storage;
  }

  private async loadData() {
    try {
      const usersData = await fs.promises.readFile(USERS_FILE, 'utf8');
      this.users = JSON.parse(usersData);
    } catch (error) {
      this.users = [];
    }

    try {
      const pendingData = await fs.promises.readFile(PENDING_USERS_FILE, 'utf8');
      this.pendingUsers = JSON.parse(pendingData);
    } catch (error) {
      this.pendingUsers = [];
    }

    try {
      const otpData = await fs.promises.readFile(OTP_CODES_FILE, 'utf8');
      this.otpCodes = JSON.parse(otpData);
    } catch (error) {
      this.otpCodes = [];
    }
  }

  private async saveData() {
    await fs.promises.writeFile(USERS_FILE, JSON.stringify(this.users, null, 2));
    await fs.promises.writeFile(PENDING_USERS_FILE, JSON.stringify(this.pendingUsers, null, 2));
    await fs.promises.writeFile(OTP_CODES_FILE, JSON.stringify(this.otpCodes, null, 2));
  }

  private async initializeAdminUser() {
    const adminEmail = 'abdulmannan32519@gmail.com';
    const existingAdmin = await this.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('Mannamkhan@786', 10);
      
      await this.createAdminUser({
        username: 'admin',
        fullName: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
      });
      
      console.log('🔧 Admin user initialized in JSON storage');
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Always match using plain email
    return this.users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = bcrypt.hashSync(insertUser.password, 10);
    const id = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    const user: User = {
      ...insertUser,
      password: hashedPassword,
      id,
      role: 'student',
      isVerified: false,
      degreeProgram: null,
      subjects: null,
      createdAt: new Date(),
    };
    this.users.push(user);
    await this.saveData();
    return user;
  }

  async createAdminUser(insertUser: Omit<InsertUser, 'email'> & { email: string }): Promise<User> {
    const id = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    const user: User = {
      ...insertUser,
      id,
      role: 'admin',
      isVerified: true,
      degreeProgram: null,
      subjects: null,
      createdAt: new Date(),
    };
    this.users.push(user);
    await this.saveData();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...updates };
    await this.saveData();
    return this.users[index];
  }

  async updateUserProfile(userId: number, degreeProgram: string, subjects: string[]): Promise<User | undefined> {
    return this.updateUser(userId, { degreeProgram, subjects });
  }

  async createPendingUser(insertPendingUser: InsertPendingUser): Promise<PendingUser> {
    const hashedPassword = bcrypt.hashSync(insertPendingUser.password, 10);
    const id = this.pendingUsers.length > 0 ? Math.max(...this.pendingUsers.map(p => p.id)) + 1 : 1;
    const pendingUser: PendingUser = {
      ...insertPendingUser,
      password: hashedPassword,
      id,
      createdAt: new Date(),
    };
    this.pendingUsers.push(pendingUser);
    await this.saveData();
    return pendingUser;
  }

  async getPendingUserByEmail(email: string): Promise<PendingUser | undefined> {
    // Always match using plain email
    return this.pendingUsers.find(p => p.email === email);
  }

  async deletePendingUser(email: string): Promise<void> {
    this.pendingUsers = this.pendingUsers.filter(p => p.email !== email);
    await this.saveData();
  }

  async createOtpCode(insertOtp: InsertOtp): Promise<OtpCode> {
    const id = this.otpCodes.length > 0 ? Math.max(...this.otpCodes.map(o => o.id)) + 1 : 1;
    const otpCode: OtpCode = {
      ...insertOtp,
      id,
      isUsed: false,
      createdAt: new Date(),
    };
    this.otpCodes.push(otpCode);
    await this.saveData();
    return otpCode;
  }

  async getValidOtpCode(email: string, code: string): Promise<OtpCode | undefined> {
    const now = new Date();
    return this.otpCodes.find(o => o.email === email && o.code === code && !o.isUsed && o.expiresAt > now);
  }

  async checkOtpCodeValidity(email: string, code: string): Promise<OtpCode | undefined> {
    const now = new Date();
    return this.otpCodes.find(o => o.email === email && o.code === code && o.expiresAt > now);
  }

  async markOtpAsUsed(id: number): Promise<void> {
    const index = this.otpCodes.findIndex(o => o.id === id);
    if (index !== -1) {
      this.otpCodes[index].isUsed = true;
      await this.saveData();
    }
  }

  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    this.otpCodes = this.otpCodes.filter(o => o.expiresAt > now);
    await this.saveData();
  }
}