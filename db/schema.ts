import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const communities = sqliteTable("communities", {
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

export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["owner", "manager", "resident"] }).notNull().default("resident"),
  unit: text("unit"),
  joinedAt: text("joined_at").notNull(),
}, table => [uniqueIndex("idx_members_community_user").on(table.communityId, table.userId)]);

export const residents = sqliteTable("residents", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  phone: text("phone"),
  occupancy: text("occupancy").notNull().default("Ev sahibi"),
  createdAt: text("created_at").notNull(),
});

export const dues = sqliteTable("dues", {
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

export const expenses = sqliteTable("expenses", {
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

export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  kind: text("kind").notNull().default("Bilgilendirme"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
});

export const decisions = sqliteTable("decisions", {
  id: text("id").primaryKey(),
  communityId: text("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  decisionNo: text("decision_no").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
});
