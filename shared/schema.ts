import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  isVerified: boolean("is_verified").default(false),
  degreeProgram: text("degree_program"),
  subjects: text("subjects").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pendingUsers = pgTable("pending_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email().refine((email) => email.endsWith("@vu.edu.pk"), {
    message: "Email must be from @vu.edu.pk domain",
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
}).pick({
  username: true,
  fullName: true,
  email: true,
  password: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().refine((email) => email.endsWith("@vu.edu.pk"), {
    message: "Email must be from @vu.edu.pk domain",
  }),
});

export const otpVerificationSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "OTP must be 6 digits"),
});

export const insertOtpSchema = createInsertSchema(otpCodes).pick({
  email: true,
  code: true,
  expiresAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PendingUser = typeof pendingUsers.$inferSelect;
export type InsertPendingUser = typeof pendingUsers.$inferInsert;
export type LoginData = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type OTPVerificationData = z.infer<typeof otpVerificationSchema>;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;

// Upload system tables
export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  uploadType: text("upload_type").notNull(), // handout, notes, guide, past_paper, guess_paper
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  textContent: text("text_content"),
  externalLink: text("external_link"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assignment/GDB solutions
export const solutions = pgTable("solutions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  solutionType: text("solution_type").notNull(), // assignment, gdb, quiz
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  textContent: text("text_content"),
  externalLink: text("external_link"),
  helpfulVotes: integer("helpful_votes").default(0),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Public discussions
export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  subject: text("subject"),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  helpfulVotes: integer("helpful_votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(false),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Badges
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  badgeType: text("badge_type").notNull(), // upload_contributor, helpful_solver, community_star
  earnedFor: text("earned_for"), // description of what earned the badge
  createdAt: timestamp("created_at").defaultNow(),
});

// System settings
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = typeof uploads.$inferInsert;
export type Solution = typeof solutions.$inferSelect;
export type InsertSolution = typeof solutions.$inferInsert;
export type Discussion = typeof discussions.$inferSelect;
export type InsertDiscussion = typeof discussions.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;
