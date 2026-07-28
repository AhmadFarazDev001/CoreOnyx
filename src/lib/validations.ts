import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  body: z.string().min(1, "Body is required").max(10000, "Body is too long"),
  priority: z.enum(["NORMAL", "URGENT"]),
  isPinned: z.boolean(),
});

export const threadSchema = z.object({
  title: z.string().min(1, "Title is required").max(150, "Title is too long"),
  isFAQ: z.boolean().optional(),
  participantUserId: z.string().optional(),
});

export const messageSchema = z.object({
  threadId: z.string().cuid("Invalid thread ID"),
  content: z.string().min(1, "Message is required").max(5000, "Message is too long"),
  isCodeSnippet: z.boolean().optional(),
});

export const disputeSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(150, "Subject is too long"),
  assessmentName: z.string().min(1, "Assessment is required").max(100, "Assessment name is too long"),
  rationale: z.string().min(1, "Rationale is required").max(5000, "Rationale is too long"),
  attachments: z.array(z.string().url()).max(5, "Too many attachments").optional(),
});

export const solutionSchema = z.object({
  title: z.string().min(1).max(150),
  labNumber: z.number().int().min(1).max(100),
  language: z.string().min(1).max(20),
  code: z.string().min(1).max(20000), // Max 20KB code
  consoleOutput: z.string().max(10000).optional().default(""),
});

export const emailWhitelistSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const bulkEmailWhitelistSchema = z.object({
  emails: z.array(z.string().email("Invalid email")).max(1000, "Max 1000 emails per bulk operation"),
});

export const onboardingSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

export const upsertGradeSchema = z.object({
  studentEmail: z.string().email("Invalid email"),
  studentName: z.string().max(100).optional().nullable(),
  assessments: z.record(z.string(), z.any()),
  totalAbsScore: z.number().min(0),
  totalAbsMax: z.number().min(0),
});
