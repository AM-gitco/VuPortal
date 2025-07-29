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

  private encrypt(text: string): string {
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'base64');
    if (!process.env.ENCRYPTION_KEY) {
      console.error('[ENCRYPTION_KEY ERROR] ENCRYPTION_KEY not set in environment. Please add ENCRYPTION_KEY (32-byte Base64) to your .env file. You can generate a secure key using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
      throw new Error('ENCRYPTION_KEY not set in environment.');
    }
    if (key.length !== 32) {
      console.error('[ENCRYPTION_KEY ERROR] ENCRYPTION_KEY must be a 32-byte Base64 string.');
      throw new Error('ENCRYPTION_KEY must be a 32-byte Base64 string.');
    }
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decrypt(text: string): string {
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'base64');
    if (!process.env.ENCRYPTION_KEY) {
      console.error('[ENCRYPTION_KEY ERROR] ENCRYPTION_KEY not set in environment. Please add ENCRYPTION_KEY (32-byte Base64) to your .env file. You can generate a secure key using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
      throw new Error('ENCRYPTION_KEY not set in environment.');
    }
    if (key.length !== 32) {
      console.error('[ENCRYPTION_KEY ERROR] ENCRYPTION_KEY must be a 32-byte Base64 string.');
      throw new Error('ENCRYPTION_KEY must be a 32-byte Base64 string.');
    }
    const [ivStr, encryptedStr] = text.split(':');
    const iv = Buffer.from(ivStr, 'hex');
    const encryptedText = Buffer.from(encryptedStr, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  constructor() {
    this.loadData();
    this.initializeAdminUser();
  }

  private loadData() {
    try {
      const usersData = fs.readFileSync(USERS_FILE, 'utf8');
      this.users = JSON.parse(usersData).map((user: any) => ({
        ...user,
        email: user.email,
        email_encrypted: user.email_encrypted || this.encrypt(user.email)
      }));
    } catch (error) {
      this.users = [];
    }

    try {
      const pendingData = fs.readFileSync(PENDING_USERS_FILE, 'utf8');
      this.pendingUsers = JSON.parse(pendingData).map((p: any) => ({
        ...p,
        email: p.email,
        email_encrypted: p.email_encrypted || this.encrypt(p.email)
      }));
    } catch (error) {
      this.pendingUsers = [];
    }

    try {
      const otpData = fs.readFileSync(OTP_CODES_FILE, 'utf8');
      this.otpCodes = JSON.parse(otpData).map((o: any) => ({
        ...o,
        email: o.email,
        email_encrypted: o.email_encrypted || this.encrypt(o.email)
      }));
    } catch (error) {
      this.otpCodes = [];
    }
  }

  private saveData() {
    // Store both plain and encrypted emails for users and pending users
    const encryptedUsers = this.users.map(user => ({ ...user, email: user.email, email_encrypted: user.email_encrypted || this.encrypt(user.email) }));
    const encryptedPending = this.pendingUsers.map(p => ({ ...p, email: p.email, email_encrypted: p.email_encrypted || this.encrypt(p.email) }));
    const encryptedOtps = this.otpCodes.map(o => ({ ...o, email: o.email, email_encrypted: o.email_encrypted || this.encrypt(o.email) }));
    fs.writeFileSync(USERS_FILE, JSON.stringify(encryptedUsers, null, 2));
    fs.writeFileSync(PENDING_USERS_FILE, JSON.stringify(encryptedPending, null, 2));
    fs.writeFileSync(OTP_CODES_FILE, JSON.stringify(encryptedOtps, null, 2));
  }

  private initializeAdminUser() {
    const adminEmail = 'abdulmannan32519@gmail.com';
    const existingAdmin = this.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('Mannamkhan@786', 10);
      
      this.createAdminUser({
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
      email_encrypted: this.encrypt(insertUser.email)
    };
    this.users.push(user);
    this.saveData();
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
    this.saveData();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...updates };
    this.saveData();
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
      email_encrypted: this.encrypt(insertPendingUser.email)
    };
    this.pendingUsers.push(pendingUser);
    this.saveData();
    return pendingUser;
  }

  async getPendingUserByEmail(email: string): Promise<PendingUser | undefined> {
    // Always match using plain email
    return this.pendingUsers.find(p => p.email === email);
  }

  async deletePendingUser(email: string): Promise<void> {
    this.pendingUsers = this.pendingUsers.filter(p => p.email !== email);
    this.saveData();
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
    this.saveData();
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
      this.saveData();
    }
  }

  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    this.otpCodes = this.otpCodes.filter(o => o.expiresAt > now);
    this.saveData();
  }
}