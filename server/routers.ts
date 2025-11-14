import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

/**
 * Extract [[wiki-style]] links from markdown content
 */
function extractWikiLinks(content: string): string[] {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  
  return Array.from(new Set(links)); // Remove duplicates
}

/**
 * Find note by title for a user
 */
async function findNoteByTitle(title: string, userId: number) {
  const allNotes = await db.getUserNotes(userId);
  return allNotes.find(note => note.title.toLowerCase() === title.toLowerCase());
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  notes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserNotes(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const note = await db.getNoteById(input.id, ctx.user.id);
        if (!note) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
        }
        return note;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(500),
        content: z.string(),
        tvObjectType: z.string().optional(),
        tvObjectAttributes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const note = await db.createNote({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          tvObjectType: input.tvObjectType || null,
          tvObjectAttributes: input.tvObjectAttributes || null,
        });

        // Extract wiki links and create bidirectional links
        const wikiLinks = extractWikiLinks(input.content);
        for (const linkTitle of wikiLinks) {
          const targetNote = await findNoteByTitle(linkTitle, ctx.user.id);
          if (targetNote) {
            await db.createLink({
              userId: ctx.user.id,
              sourceNoteId: note.id,
              targetNoteId: targetNote.id,
              relationshipType: null,
              evidence: null,
            });
          }
        }

        return note;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(500).optional(),
        content: z.string().optional(),
        tvObjectType: z.string().optional(),
        tvObjectAttributes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        
        // If content is being updated, reprocess wiki links
        if (updates.content !== undefined) {
          // Delete existing links from this note
          const existingLinks = await db.getLinksForNote(id, ctx.user.id);
          for (const link of existingLinks) {
            if (link.sourceNoteId === id) {
              await db.deleteLink(link.id, ctx.user.id);
            }
          }

          // Create new links based on updated content
          const wikiLinks = extractWikiLinks(updates.content);
          for (const linkTitle of wikiLinks) {
            const targetNote = await findNoteByTitle(linkTitle, ctx.user.id);
            if (targetNote && targetNote.id !== id) {
              await db.createLink({
                userId: ctx.user.id,
                sourceNoteId: id,
                targetNoteId: targetNote.id,
                relationshipType: null,
                evidence: null,
              });
            }
          }
        }

        const note = await db.updateNote(id, ctx.user.id, updates);
        if (!note) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
        }
        return note;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteNote(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  links: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserLinks(ctx.user.id);
    }),

    forNote: protectedProcedure
      .input(z.object({ noteId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getLinksForNote(input.noteId, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        sourceNoteId: z.number(),
        targetNoteId: z.number(),
        relationshipType: z.string().optional(),
        evidence: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createLink({
          userId: ctx.user.id,
          sourceNoteId: input.sourceNoteId,
          targetNoteId: input.targetNoteId,
          relationshipType: input.relationshipType || null,
          evidence: input.evidence || null,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteLink(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  graph: router({
    data: protectedProcedure.query(async ({ ctx }) => {
      const notes = await db.getUserNotes(ctx.user.id);
      const links = await db.getUserLinks(ctx.user.id);

      return {
        nodes: notes.map(note => ({
          id: note.id,
          title: note.title,
          tvObjectType: note.tvObjectType,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        })),
        edges: links.map(link => ({
          id: link.id,
          source: link.sourceNoteId,
          target: link.targetNoteId,
          relationshipType: link.relationshipType,
        })),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
