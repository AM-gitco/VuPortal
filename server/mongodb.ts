import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IStorage } from './storage';
import { config } from './config';
import { InsertUser, InsertPendingUser, InsertOtp, User, PendingUser, OtpCode } from '@shared/schema';

// MongoDB connection
const connectToMongoDB = async () => {
  try {
    if (!config.MONGODB_URI) {
      console.warn('MongoDB URI not provided. Using fallback storage.');
      return false;
    }

    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// MongoDB schemas
const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  degreeProgram: { type: String, default: null },
  subjects: { type: [String], default: null },
  createdAt: { type: Date, default: Date.now },
});

const pendingUserSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const otpCodeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// MongoDB models
const UserModel = mongoose.model('User', userSchema);
const PendingUserModel = mongoose.model('PendingUser', pendingUserSchema);
const OtpCodeModel = mongoose.model('OtpCode', otpCodeSchema);

// MongoDB storage implementation
export class MongoDBStorage implements IStorage {
  private connected: boolean = false;
  private fallbackStorage: IStorage;

  constructor(fallbackStorage: IStorage) {
    this.fallbackStorage = fallbackStorage;
    this.initialize();
  }

  private async initialize() {
    this.connected = await connectToMongoDB();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    if (!this.connected) return this.fallbackStorage.getUser(id);
    
    const user = await UserModel.findOne({ id });
    return user ? user.toObject() as unknown as User : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.connected) return this.fallbackStorage.getUserByUsername(username);
    
    const user = await UserModel.findOne({ username });
    return user ? user.toObject() as unknown as User : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!this.connected) return this.fallbackStorage.getUserByEmail(email);
    
    const user = await UserModel.findOne({ email });
    return user ? user.toObject() as unknown as User : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.connected) return this.fallbackStorage.createUser(insertUser);
    
    // Get the next ID (you might want to implement a more robust ID generation strategy)
    const maxIdUser = await UserModel.findOne().sort('-id');
    const nextId = maxIdUser ? (maxIdUser.id as number) + 1 : 1;
    
    const user: User = {
      ...insertUser,
      id: nextId,
      role: "student",
      isVerified: false,
      degreeProgram: null,
      subjects: null,
      createdAt: new Date(),
    };
    
    const createdUser = await UserModel.create(user);
    return createdUser.toObject() as unknown as User;
  }

  async createAdminUser(insertUser: Omit<InsertUser, 'email'> & { email: string }): Promise<User> {
    if (!this.connected) return this.fallbackStorage.createAdminUser(insertUser);
    
    // Get the next ID
    const maxIdUser = await UserModel.findOne().sort('-id');
    const nextId = maxIdUser ? (maxIdUser.id as number) + 1 : 1;
    
    const user: User = {
      ...insertUser,
      id: nextId,
      role: "admin",
      isVerified: true,
      degreeProgram: null,
      subjects: null,
      createdAt: new Date(),
    };
    
    const createdUser = await UserModel.create(user);
    return createdUser.toObject() as unknown as User;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    if (!this.connected) return this.fallbackStorage.updateUser(id, updates);
    
    const updatedUser = await UserModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );
    
    return updatedUser ? updatedUser.toObject() as unknown as User : undefined;
  }

  async updateUserProfile(userId: number, degreeProgram: string, subjects: string[]): Promise<User | undefined> {
    if (!this.connected) return this.fallbackStorage.updateUserProfile(userId, degreeProgram, subjects);
    
    const updatedUser = await UserModel.findOneAndUpdate(
      { id: userId },
      { $set: { degreeProgram, subjects } },
      { new: true }
    );
    
    return updatedUser ? updatedUser.toObject() as unknown as User : undefined;
  }

  // Pending user methods
  async createPendingUser(insertPendingUser: InsertPendingUser): Promise<PendingUser> {
    if (!this.connected) return this.fallbackStorage.createPendingUser(insertPendingUser);
    
    // Get the next ID
    const maxIdPendingUser = await PendingUserModel.findOne().sort('-id');
    const nextId = maxIdPendingUser ? (maxIdPendingUser.id as number) + 1 : 1;
    
    const pendingUser: PendingUser = {
      ...insertPendingUser,
      id: nextId,
      createdAt: new Date(),
    };
    
    const createdPendingUser = await PendingUserModel.create(pendingUser);
    return createdPendingUser.toObject() as unknown as PendingUser;
  }

  async getPendingUserByEmail(email: string): Promise<PendingUser | undefined> {
    if (!this.connected) return this.fallbackStorage.getPendingUserByEmail(email);
    
    const pendingUser = await PendingUserModel.findOne({ email });
    return pendingUser ? pendingUser.toObject() as unknown as PendingUser : undefined;
  }

  async deletePendingUser(email: string): Promise<void> {
    if (!this.connected) return this.fallbackStorage.deletePendingUser(email);
    
    await PendingUserModel.deleteOne({ email });
  }

  // OTP methods
  async createOtpCode(insertOtp: InsertOtp): Promise<OtpCode> {
    if (!this.connected) return this.fallbackStorage.createOtpCode(insertOtp);
    
    // Get the next ID
    const maxIdOtp = await OtpCodeModel.findOne().sort('-id');
    const nextId = maxIdOtp ? (maxIdOtp.id as number) + 1 : 1;
    
    const otpCode: OtpCode = {
      ...insertOtp,
      id: nextId,
      isUsed: false,
      createdAt: new Date(),
    };
    
    const createdOtp = await OtpCodeModel.create(otpCode);
    return createdOtp.toObject() as unknown as OtpCode;
  }

  async getValidOtpCode(email: string, code: string): Promise<OtpCode | undefined> {
    if (!this.connected) return this.fallbackStorage.getValidOtpCode(email, code);
    
    const now = new Date();
    const otpCode = await OtpCodeModel.findOne({
      email,
      code,
      isUsed: false,
      expiresAt: { $gt: now }
    });
    
    return otpCode ? otpCode.toObject() as unknown as OtpCode : undefined;
  }

  async checkOtpCodeValidity(email: string, code: string): Promise<OtpCode | undefined> {
    if (!this.connected) return this.fallbackStorage.checkOtpCodeValidity(email, code);
    
    const now = new Date();
    const otpCode = await OtpCodeModel.findOne({
      email,
      code,
      expiresAt: { $gt: now }
    });
    
    return otpCode ? otpCode.toObject() as unknown as OtpCode : undefined;
  }

  async markOtpAsUsed(id: number): Promise<void> {
    if (!this.connected) return this.fallbackStorage.markOtpAsUsed(id);
    
    await OtpCodeModel.updateOne(
      { id },
      { $set: { isUsed: true } }
    );
  }

  async cleanupExpiredOtps(): Promise<void> {
    if (!this.connected) return this.fallbackStorage.cleanupExpiredOtps();
    
    const now = new Date();
    await OtpCodeModel.deleteMany({
      expiresAt: { $lt: now }
    });
  }
}