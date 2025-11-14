import { and, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, notes, links, InsertNote, InsertLink, Note, Link } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Notes Operations ============

export async function createNote(note: InsertNote): Promise<Note> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notes).values(note);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(notes).where(eq(notes.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getUserNotes(userId: number): Promise<Note[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(notes.updatedAt);
}

export async function getNoteById(noteId: number, userId: number): Promise<Note | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1);
  
  return result[0];
}

export async function updateNote(noteId: number, userId: number, updates: Partial<InsertNote>): Promise<Note | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notes)
    .set(updates)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

  return getNoteById(noteId, userId);
}

export async function deleteNote(noteId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete associated links first
  await db.delete(links).where(
    and(
      eq(links.userId, userId),
      or(eq(links.sourceNoteId, noteId), eq(links.targetNoteId, noteId))
    )
  );

  // Delete the note
  await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}

// ============ Links Operations ============

export async function createLink(link: InsertLink): Promise<Link> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if link already exists
  const existing = await db.select().from(links)
    .where(
      and(
        eq(links.userId, link.userId),
        eq(links.sourceNoteId, link.sourceNoteId),
        eq(links.targetNoteId, link.targetNoteId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db.insert(links).values(link);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(links).where(eq(links.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getUserLinks(userId: number): Promise<Link[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(links).where(eq(links.userId, userId));
}

export async function getLinksForNote(noteId: number, userId: number): Promise<Link[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(links)
    .where(
      and(
        eq(links.userId, userId),
        or(eq(links.sourceNoteId, noteId), eq(links.targetNoteId, noteId))
      )
    );
}

export async function deleteLink(linkId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(links).where(and(eq(links.id, linkId), eq(links.userId, userId)));
}

export async function deleteLinkBetweenNotes(sourceId: number, targetId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(links).where(
    and(
      eq(links.userId, userId),
      eq(links.sourceNoteId, sourceId),
      eq(links.targetNoteId, targetId)
    )
  );
}
