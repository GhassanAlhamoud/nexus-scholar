import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Notes table - stores all research notes and TV-Objects
 */
export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  /** TV-Object type: null for regular notes, or Actor/Event/Condition/Ideology/Source/Claim/Method */
  tvObjectType: varchar("tvObjectType", { length: 50 }),
  /** JSON string storing TV-Object attributes */
  tvObjectAttributes: text("tvObjectAttributes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  titleIdx: index("title_idx").on(table.title),
}));

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

/**
 * Links table - stores bidirectional relationships between notes
 * Each link is stored once with source -> target direction
 * Bidirectional navigation is handled by querying both directions
 */
export const links = mysqlTable("links", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sourceNoteId: int("sourceNoteId").notNull(),
  targetNoteId: int("targetNoteId").notNull(),
  /** Relationship type: null for basic links, or IS_SUPPORTED_BY/CRITIQUES/IS_CAUSED_BY etc */
  relationshipType: varchar("relationshipType", { length: 100 }),
  /** Optional evidence text or annotation for the link */
  evidence: text("evidence"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  sourceIdx: index("sourceNoteId_idx").on(table.sourceNoteId),
  targetIdx: index("targetNoteId_idx").on(table.targetNoteId),
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type Link = typeof links.$inferSelect;
export type InsertLink = typeof links.$inferInsert;
