/**
 * Core type definitions for the application.
 * Extends Prisma types with relational data to ensure strict typing across components.
 */
import { 
  User as PrismaUser, 
  Announcement as PrismaAnnouncement,
  Solution as PrismaSolution,
  Annotation as PrismaAnnotation,
  ChatThread as PrismaChatThread,
  ChatMessage as PrismaChatMessage,
  GradeRecord as PrismaGradeRecord,
  DisputeTicket as PrismaDisputeTicket,
  Role
} from '@prisma/client';

export type User = PrismaUser;

export type Announcement = PrismaAnnouncement & {
  author: {
    id: string;
    name: string;
    image: string | null;
    role: Role;
  };
};

export type Annotation = PrismaAnnotation;

export type Solution = PrismaSolution & {
  annotations: Annotation[];
};

export type ChatThread = PrismaChatThread & {
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isResolved?: boolean;
};

export type ChatMessage = PrismaChatMessage & {
  sender: {
    id: string;
    name: string;
    image: string | null;
    role: Role;
  };
};

export type GradeRecord = PrismaGradeRecord;

export type DisputeTicket = PrismaDisputeTicket & {
  student?: {
    name: string;
    email: string;
  };
};

