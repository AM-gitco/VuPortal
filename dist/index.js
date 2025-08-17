var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// server/index.ts
import express2 from "express";
import session from "express-session";

// server/routes.ts
import { createServer } from "http";

// server/config.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
var config = {
  PORT: process.env.PORT || 3e3,
  NODE_ENV: process.env.NODE_ENV || "development",
  SESSION_SECRET: process.env.SESSION_SECRET || "your-secret-key",
  MONGODB_URI: process.env.MONGODB_URI || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  USE_MONGODB: process.env.USE_MONGODB === "true",
  BCRYPT_SALT_ROUNDS: 10
};

// server/mongodb.ts
import mongoose from "mongoose";
var connectToMongoDB = async () => {
  try {
    if (!config.MONGODB_URI) {
      console.warn("MongoDB URI not provided. Using fallback storage.");
      return false;
    }
    await mongoose.connect(config.MONGODB_URI);
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
};
var userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  isVerified: { type: Boolean, default: false },
  degreeProgram: { type: String, default: null },
  subjects: { type: [String], default: null },
  createdAt: { type: Date, default: Date.now }
});
var pendingUserSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
var otpCodeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
var UserModel = mongoose.model("User", userSchema);
var PendingUserModel = mongoose.model("PendingUser", pendingUserSchema);
var OtpCodeModel = mongoose.model("OtpCode", otpCodeSchema);
var MongoDBStorage = class {
  connected = false;
  fallbackStorage;
  constructor(fallbackStorage) {
    this.fallbackStorage = fallbackStorage;
    this.initialize();
  }
  async initialize() {
    this.connected = await connectToMongoDB();
  }
  // User methods
  async getUser(id) {
    if (!this.connected) return this.fallbackStorage.getUser(id);
    const user = await UserModel.findOne({ id });
    return user ? user.toObject() : void 0;
  }
  async getUserByUsername(username) {
    if (!this.connected) return this.fallbackStorage.getUserByUsername(username);
    const user = await UserModel.findOne({ username });
    return user ? user.toObject() : void 0;
  }
  async getUserByEmail(email) {
    if (!this.connected) return this.fallbackStorage.getUserByEmail(email);
    const user = await UserModel.findOne({ email });
    return user ? user.toObject() : void 0;
  }
  async createUser(insertUser) {
    if (!this.connected) return this.fallbackStorage.createUser(insertUser);
    const maxIdUser = await UserModel.findOne().sort("-id");
    const nextId = maxIdUser ? maxIdUser.id + 1 : 1;
    const user = {
      ...insertUser,
      id: nextId,
      role: "student",
      isVerified: false,
      degreeProgram: null,
      subjects: null,
      createdAt: /* @__PURE__ */ new Date()
    };
    const createdUser = await UserModel.create(user);
    return createdUser.toObject();
  }
  async createAdminUser(insertUser) {
    if (!this.connected) return this.fallbackStorage.createAdminUser(insertUser);
    const maxIdUser = await UserModel.findOne().sort("-id");
    const nextId = maxIdUser ? maxIdUser.id + 1 : 1;
    const user = {
      ...insertUser,
      id: nextId,
      role: "admin",
      isVerified: true,
      degreeProgram: null,
      subjects: null,
      createdAt: /* @__PURE__ */ new Date()
    };
    const createdUser = await UserModel.create(user);
    return createdUser.toObject();
  }
  async updateUser(id, updates) {
    if (!this.connected) return this.fallbackStorage.updateUser(id, updates);
    const updatedUser = await UserModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );
    return updatedUser ? updatedUser.toObject() : void 0;
  }
  async updateUserProfile(userId, degreeProgram, subjects) {
    if (!this.connected) return this.fallbackStorage.updateUserProfile(userId, degreeProgram, subjects);
    const updatedUser = await UserModel.findOneAndUpdate(
      { id: userId },
      { $set: { degreeProgram, subjects } },
      { new: true }
    );
    return updatedUser ? updatedUser.toObject() : void 0;
  }
  // Pending user methods
  async createPendingUser(insertPendingUser) {
    if (!this.connected) return this.fallbackStorage.createPendingUser(insertPendingUser);
    const maxIdPendingUser = await PendingUserModel.findOne().sort("-id");
    const nextId = maxIdPendingUser ? maxIdPendingUser.id + 1 : 1;
    const pendingUser = {
      ...insertPendingUser,
      id: nextId,
      createdAt: /* @__PURE__ */ new Date()
    };
    const createdPendingUser = await PendingUserModel.create(pendingUser);
    return createdPendingUser.toObject();
  }
  async getPendingUserByEmail(email) {
    if (!this.connected) return this.fallbackStorage.getPendingUserByEmail(email);
    const pendingUser = await PendingUserModel.findOne({ email });
    return pendingUser ? pendingUser.toObject() : void 0;
  }
  async deletePendingUser(email) {
    if (!this.connected) return this.fallbackStorage.deletePendingUser(email);
    await PendingUserModel.deleteOne({ email });
  }
  // OTP methods
  async createOtpCode(insertOtp) {
    if (!this.connected) return this.fallbackStorage.createOtpCode(insertOtp);
    const maxIdOtp = await OtpCodeModel.findOne().sort("-id");
    const nextId = maxIdOtp ? maxIdOtp.id + 1 : 1;
    const otpCode = {
      ...insertOtp,
      id: nextId,
      isUsed: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    const createdOtp = await OtpCodeModel.create(otpCode);
    return createdOtp.toObject();
  }
  async getValidOtpCode(email, code) {
    if (!this.connected) return this.fallbackStorage.getValidOtpCode(email, code);
    const now = /* @__PURE__ */ new Date();
    const otpCode = await OtpCodeModel.findOne({
      email,
      code,
      isUsed: false,
      expiresAt: { $gt: now }
    });
    return otpCode ? otpCode.toObject() : void 0;
  }
  async checkOtpCodeValidity(email, code) {
    if (!this.connected) return this.fallbackStorage.checkOtpCodeValidity(email, code);
    const now = /* @__PURE__ */ new Date();
    const otpCode = await OtpCodeModel.findOne({
      email,
      code,
      expiresAt: { $gt: now }
    });
    return otpCode ? otpCode.toObject() : void 0;
  }
  async markOtpAsUsed(id) {
    if (!this.connected) return this.fallbackStorage.markOtpAsUsed(id);
    await OtpCodeModel.updateOne(
      { id },
      { $set: { isUsed: true } }
    );
  }
  async cleanupExpiredOtps() {
    if (!this.connected) return this.fallbackStorage.cleanupExpiredOtps();
    const now = /* @__PURE__ */ new Date();
    await OtpCodeModel.deleteMany({
      expiresAt: { $lt: now }
    });
  }
};

// server/json_storage.ts
import fs from "fs";
import path2 from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import crypto from "crypto";
var __filename = fileURLToPath(import.meta.url);
var __dirname2 = path2.dirname(__filename);
var USERS_FILE = path2.join(__dirname2, "users.json");
var PENDING_USERS_FILE = path2.join(__dirname2, "pending_users.json");
var OTP_CODES_FILE = path2.join(__dirname2, "otp_codes.json");
var JsonStorage = class _JsonStorage {
  users = [];
  pendingUsers = [];
  otpCodes = [];
  encrypt(text2) {
    const key = Buffer.from(process.env.ENCRYPTION_KEY || "", "base64");
    if (!process.env.ENCRYPTION_KEY) {
      console.error(`[ENCRYPTION_KEY ERROR] ENCRYPTION_KEY not set in environment. Please add ENCRYPTION_KEY (32-byte Base64) to your .env file. You can generate a secure key using: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`);
      throw new Error("ENCRYPTION_KEY not set in environment.");
    }
    if (key.length !== 32) {
      console.error("[ENCRYPTION_KEY ERROR] ENCRYPTION_KEY must be a 32-byte Base64 string.");
      throw new Error("ENCRYPTION_KEY must be a 32-byte Base64 string.");
    }
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text2);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }
  decrypt(text2) {
    const key = Buffer.from(process.env.ENCRYPTION_KEY || "", "base64");
    if (!process.env.ENCRYPTION_KEY) {
      console.error(`[ENCRYPTION_KEY ERROR] ENCRYPTION_KEY not set in environment. Please add ENCRYPTION_KEY (32-byte Base64) to your .env file. You can generate a secure key using: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`);
      throw new Error("ENCRYPTION_KEY not set in environment.");
    }
    if (key.length !== 32) {
      console.error("[ENCRYPTION_KEY ERROR] ENCRYPTION_KEY must be a 32-byte Base64 string.");
      throw new Error("ENCRYPTION_KEY must be a 32-byte Base64 string.");
    }
    const [ivStr, encryptedStr] = text2.split(":");
    const iv = Buffer.from(ivStr, "hex");
    const encryptedText = Buffer.from(encryptedStr, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
  constructor() {
  }
  static async create() {
    const storage2 = new _JsonStorage();
    await storage2.loadData();
    await storage2.initializeAdminUser();
    return storage2;
  }
  async loadData() {
    try {
      const usersData = await fs.promises.readFile(USERS_FILE, "utf8");
      this.users = JSON.parse(usersData).map((user) => ({
        ...user,
        email: user.email,
        email_encrypted: user.email_encrypted || this.encrypt(user.email)
      }));
    } catch (error) {
      this.users = [];
    }
    try {
      const pendingData = await fs.promises.readFile(PENDING_USERS_FILE, "utf8");
      this.pendingUsers = JSON.parse(pendingData).map((p) => ({
        ...p,
        email: p.email,
        email_encrypted: p.email_encrypted || this.encrypt(p.email)
      }));
    } catch (error) {
      this.pendingUsers = [];
    }
    try {
      const otpData = await fs.promises.readFile(OTP_CODES_FILE, "utf8");
      this.otpCodes = JSON.parse(otpData).map((o) => ({
        ...o,
        email: o.email,
        email_encrypted: o.email_encrypted || this.encrypt(o.email)
      }));
    } catch (error) {
      this.otpCodes = [];
    }
  }
  async saveData() {
    const encryptedUsers = this.users.map((user) => ({ ...user, email: user.email, email_encrypted: user.email_encrypted || this.encrypt(user.email) }));
    const encryptedPending = this.pendingUsers.map((p) => ({ ...p, email: p.email, email_encrypted: p.email_encrypted || this.encrypt(p.email) }));
    const encryptedOtps = this.otpCodes.map((o) => ({ ...o, email: o.email, email_encrypted: o.email_encrypted || this.encrypt(o.email) }));
    await fs.promises.writeFile(USERS_FILE, JSON.stringify(encryptedUsers, null, 2));
    await fs.promises.writeFile(PENDING_USERS_FILE, JSON.stringify(encryptedPending, null, 2));
    await fs.promises.writeFile(OTP_CODES_FILE, JSON.stringify(encryptedOtps, null, 2));
  }
  async initializeAdminUser() {
    const adminEmail = "abdulmannan32519@gmail.com";
    const existingAdmin = await this.getUserByEmail(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync("Mannamkhan@786", 10);
      await this.createAdminUser({
        username: "admin",
        fullName: "Admin User",
        email: adminEmail,
        password: hashedPassword
      });
      console.log("\u{1F527} Admin user initialized in JSON storage");
    }
  }
  async getUser(id) {
    return this.users.find((user) => user.id === id);
  }
  async getUserByUsername(username) {
    return this.users.find((user) => user.username === username);
  }
  async getUserByEmail(email) {
    return this.users.find((user) => user.email === email);
  }
  async createUser(insertUser) {
    const hashedPassword = bcrypt.hashSync(insertUser.password, 10);
    const id = this.users.length > 0 ? Math.max(...this.users.map((u) => u.id)) + 1 : 1;
    const user = {
      ...insertUser,
      password: hashedPassword,
      id,
      role: "student",
      isVerified: false,
      degreeProgram: null,
      subjects: null,
      createdAt: /* @__PURE__ */ new Date(),
      email_encrypted: this.encrypt(insertUser.email)
    };
    this.users.push(user);
    await this.saveData();
    return user;
  }
  async createAdminUser(insertUser) {
    const id = this.users.length > 0 ? Math.max(...this.users.map((u) => u.id)) + 1 : 1;
    const user = {
      ...insertUser,
      id,
      role: "admin",
      isVerified: true,
      degreeProgram: null,
      subjects: null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.push(user);
    await this.saveData();
    return user;
  }
  async updateUser(id, updates) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return void 0;
    this.users[index] = { ...this.users[index], ...updates };
    await this.saveData();
    return this.users[index];
  }
  async updateUserProfile(userId, degreeProgram, subjects) {
    return this.updateUser(userId, { degreeProgram, subjects });
  }
  async createPendingUser(insertPendingUser) {
    const hashedPassword = bcrypt.hashSync(insertPendingUser.password, 10);
    const id = this.pendingUsers.length > 0 ? Math.max(...this.pendingUsers.map((p) => p.id)) + 1 : 1;
    const pendingUser = {
      ...insertPendingUser,
      password: hashedPassword,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      email_encrypted: this.encrypt(insertPendingUser.email)
    };
    this.pendingUsers.push(pendingUser);
    this.saveData();
    return pendingUser;
  }
  async getPendingUserByEmail(email) {
    return this.pendingUsers.find((p) => p.email === email);
  }
  async deletePendingUser(email) {
    this.pendingUsers = this.pendingUsers.filter((p) => p.email !== email);
    await this.saveData();
  }
  async createOtpCode(insertOtp) {
    const id = this.otpCodes.length > 0 ? Math.max(...this.otpCodes.map((o) => o.id)) + 1 : 1;
    const otpCode = {
      ...insertOtp,
      id,
      isUsed: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.otpCodes.push(otpCode);
    await this.saveData();
    return otpCode;
  }
  async getValidOtpCode(email, code) {
    const now = /* @__PURE__ */ new Date();
    return this.otpCodes.find((o) => o.email === email && o.code === code && !o.isUsed && o.expiresAt > now);
  }
  async checkOtpCodeValidity(email, code) {
    const now = /* @__PURE__ */ new Date();
    return this.otpCodes.find((o) => o.email === email && o.code === code && o.expiresAt > now);
  }
  async markOtpAsUsed(id) {
    const index = this.otpCodes.findIndex((o) => o.id === id);
    if (index !== -1) {
      this.otpCodes[index].isUsed = true;
      await this.saveData();
    }
  }
  async cleanupExpiredOtps() {
    const now = /* @__PURE__ */ new Date();
    this.otpCodes = this.otpCodes.filter((o) => o.expiresAt > now);
    await this.saveData();
  }
};

// server/storage.ts
var storage;
if (config.USE_MONGODB && config.MONGODB_URI) {
  const jsonStorage = await JsonStorage.create();
  storage = new MongoDBStorage(jsonStorage);
  console.log("Using MongoDB storage with JsonStorage fallback");
} else {
  storage = await JsonStorage.create();
  console.log("Using JsonStorage (no MongoDB configured)");
}

// shared/schema.ts
import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  isVerified: boolean("is_verified").default(false),
  degreeProgram: text("degree_program"),
  subjects: text("subjects").array(),
  createdAt: timestamp("created_at").defaultNow()
});
var pendingUsers = pgTable("pending_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users, {
  email: z.string().email().refine((email) => email.endsWith("@vu.edu.pk"), {
    message: "Email must be from @vu.edu.pk domain"
  }),
  password: z.string().min(8, "Password must be at least 8 characters")
}).pick({
  username: true,
  fullName: true,
  email: true,
  password: true
});
var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required")
});
var resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var forgotPasswordSchema = z.object({
  email: z.string().email().refine((email) => email.endsWith("@vu.edu.pk"), {
    message: "Email must be from @vu.edu.pk domain"
  })
});
var otpVerificationSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "OTP must be 6 digits")
});
var insertOtpSchema = createInsertSchema(otpCodes).pick({
  email: true,
  code: true,
  expiresAt: true
});
var uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  uploadType: text("upload_type").notNull(),
  // handout, notes, guide, past_paper, guess_paper
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  textContent: text("text_content"),
  externalLink: text("external_link"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var solutions = pgTable("solutions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  solutionType: text("solution_type").notNull(),
  // assignment, gdb, quiz
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  textContent: text("text_content"),
  externalLink: text("external_link"),
  helpfulVotes: integer("helpful_votes").default(0),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  subject: text("subject"),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  helpfulVotes: integer("helpful_votes").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(false),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  badgeType: text("badge_type").notNull(),
  // upload_contributor, helpful_solver, community_star
  earnedFor: text("earned_for"),
  // description of what earned the badge
  createdAt: timestamp("created_at").defaultNow()
});
var systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow()
});

// server/routes.ts
import bcrypt2 from "bcrypt";
import nodemailer from "nodemailer";
async function registerRoutes(app2) {
  const generateOTP = () => {
    return Math.floor(1e5 + Math.random() * 9e5).toString();
  };
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      const hashedPassword = await bcrypt2.hash(userData.password, 10);
      const pendingUser = await storage.createPendingUser({
        ...userData,
        password: hashedPassword
      });
      const otpCode = generateOTP();
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      await storage.createOtpCode({
        email: pendingUser.email,
        code: otpCode,
        expiresAt
      });
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: pendingUser.email,
        subject: "Your Signup OTP Code",
        text: `Your OTP code is ${otpCode}. It expires in 10 minutes.

Full Name: ${pendingUser.fullName}
Username: ${pendingUser.username}`
      });
      res.status(201).json({
        message: "Registration initiated. Please check your email for verification code.",
        email: pendingUser.email
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isValidPassword = await bcrypt2.compare(loginData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (user.role === "admin") {
        req.session.userId = user.id;
        const { password: password2, ...userWithoutPassword2 } = user;
        console.log(`\u2705 Admin login successful for: ${user.email}`);
        return res.json({
          message: "Admin login successful",
          user: userWithoutPassword2
        });
      }
      if (!loginData.email.endsWith("@vu.edu.pk")) {
        return res.status(403).json({
          message: "Only VU students with @vu.edu.pk emails can access this portal"
        });
      }
      if (!user.isVerified) {
        return res.status(403).json({
          message: "Please verify your email before logging in",
          requiresVerification: true,
          email: user.email
        });
      }
      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      console.log(`\u2705 Student login successful for: ${user.email}`);
      res.json({
        message: "Login successful",
        user: userWithoutPassword
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/user/setup-profile", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { degreeProgram, subjects } = req.body;
      if (!degreeProgram || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({
          message: "Degree program and at least one subject are required"
        });
      }
      const userId = req.session.userId;
      const updatedUser = await storage.updateUserProfile(userId, degreeProgram, subjects);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({
        message: "Profile setup completed successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error setting up profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }
      const otpCode = generateOTP();
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      await storage.createOtpCode({
        email,
        code: otpCode,
        expiresAt
      });
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Password Reset OTP",
        text: `Your password reset OTP code is ${otpCode}. It expires in 10 minutes.`
      });
      res.json({
        message: "Password reset code sent to your email",
        email
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, code } = otpVerificationSchema.parse(req.body);
      const otpRecord = await storage.getValidOtpCode(email, code);
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      const pendingUser = await storage.getPendingUserByEmail(email);
      if (pendingUser) {
        await storage.markOtpAsUsed(otpRecord.id);
        const user = await storage.createUser({
          username: pendingUser.username,
          fullName: pendingUser.fullName,
          email: pendingUser.email,
          password: pendingUser.password
        });
        await storage.updateUser(user.id, { isVerified: true });
        await storage.deletePendingUser(email);
        console.log(`\u2705 User registration completed for: ${user.email}`);
        console.log(`\u{1F464} Username: ${user.username}, Full Name: ${user.fullName}`);
        res.json({
          message: "Email verified and registration completed successfully",
          user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName }
        });
      } else {
        const user = await storage.getUserByEmail(email);
        if (user) {
          res.json({
            message: "OTP verified successfully. You can now reset your password.",
            canResetPassword: true,
            email: user.email
          });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      }
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }
      const otpCode = generateOTP();
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      await storage.createOtpCode({
        email,
        code: otpCode,
        expiresAt
      });
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Resent OTP Code",
        text: `Your new OTP code is ${otpCode}. It expires in 10 minutes.`
      });
      res.json({
        message: "New verification code sent to your email",
        email
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  setInterval(async () => {
    await storage.cleanupExpiredOtps();
  }, 5 * 60 * 1e3);
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = resetPasswordSchema.parse(req.body);
      const otpRecord = await storage.checkOtpCodeValidity(email, code);
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const hashedPassword = await bcrypt2.hash(newPassword, 10);
      await storage.updateUser(user.id, { password: hashedPassword });
      await storage.markOtpAsUsed(otpRecord.id);
      console.log(`\u{1F510} Password reset successful for: ${user.email}`);
      res.json({
        message: "Password updated successfully. You can now log in with your new password."
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.redirect("/auth");
    });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(session({
  secret: "vu-auth-portal-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  app.get(/^\/(?!api\/).*/, (req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.accepts("html")) {
      res.sendFile(__require("path").join(__dirname, "../client/index.html"));
    } else {
      next();
    }
  });
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
