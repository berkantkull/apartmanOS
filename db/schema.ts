import { integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const appUsers = pgTable("app_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  phone: text("phone"),
  emailVerified: integer("email_verified").notNull().default(0),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  googleSub: text("google_sub").unique(),
  createdAt: text("created_at").notNull(),
});

export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
}, table => [uniqueIndex("idx_sessions_token_user").on(table.tokenHash, table.userId)]);

export const authLimits = pgTable("auth_limits", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull().default(0),
  resetAt: integer("reset_at").notNull(),
});

export const communities = pgTable("communities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  blockCount: integer("block_count").notNull().default(1),
  unitCount: integer("unit_count").notNull().default(1),
  monthlyDue: integer("monthly_due").notNull().default(0),
  period: text("period").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  ownerUserId: text("owner_user_id").notNull(),
  createdAt: text("created_at").notNull(),
});

export const members = pgTable("members", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["owner", "manager", "resident"] }).notNull().default("resident"),
  unit: text("unit"),
  phone: text("phone"),
  joinedAt: text("joined_at").notNull(),
}, table => [uniqueIndex("idx_members_community_user").on(table.communityId, table.userId)]);

export const residents = pgTable("residents", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  phone: text("phone"),
  occupancy: text("occupancy").notNull().default("Ev sahibi"),
  createdAt: text("created_at").notNull(),
});

export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  unit: text("unit"),
  phone: text("phone"),
  status: text("status", { enum: ["pending", "joined"] }).notNull().default("pending"),
  invitedBy: text("invited_by").notNull(),
  createdAt: text("created_at").notNull(),
  acceptedAt: text("accepted_at"),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  kind: text("kind").notNull().default("announcement"),
  readAt: text("read_at"),
  createdAt: text("created_at").notNull(),
});

export const authTokens = pgTable("auth_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["verify", "reset"] }).notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const dues = pgTable("dues", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  residentName: text("resident_name").notNull(),
  unit: text("unit").notNull(),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["pending", "paid", "late"] }).notNull().default("pending"),
  dueDate: text("due_date").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
});

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  amount: integer("amount").notNull(),
  note: text("note"),
  expenseDate: text("expense_date").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
});

export const announcements = pgTable("announcements", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  kind: text("kind").notNull().default("Bilgilendirme"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
});

export const decisions = pgTable("decisions", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  decisionNo: text("decision_no").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
});
