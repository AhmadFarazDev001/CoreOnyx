"use server";

import { put, del } from '@vercel/blob';
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { TicketStatus, Prisma } from "@prisma/client";
import { disputeSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Creates a new dispute ticket for a student.
 * Applies rate limiting to prevent abuse.
 */
export async function createDispute(data: { subject: string; assessmentName: string; rationale: string; attachments: string[] }) {
  const { session } = await requireAuth();
  
  if (!checkRateLimit(session.user.id, "createDispute", 5, 300000)) { // 5 per 5 minutes
    throw new Error("Rate limit exceeded for creating disputes.");
  }

  const validated = disputeSchema.parse(data);

  const ticket = await prisma.disputeTicket.create({
    data: {
      subject: validated.subject,
      assessmentName: validated.assessmentName,
      rationale: validated.rationale,
      attachments: validated.attachments || [],
      studentId: session.user.id,
    },
  });

  revalidatePath("/disputes");
  revalidatePath("/admin/tickets");
  return ticket;
}

/**
 * Uploads an attachment to Vercel Blob storage.
 * Applies size, type, and rate limit validations.
 */
export async function uploadFileToBlob(formData: FormData) {
  const { session } = await requireAuth();

  if (!checkRateLimit(session.user.id, "uploadBlob", 10, 60000)) { // 10 per minute
    throw new Error("Rate limit exceeded for file uploads.");
  }

  const file = formData.get('file') as File;
  if (!file) throw new Error("No file provided");

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'text/csv'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Invalid file type");
  if (file.size > MAX_SIZE) throw new Error("File too large");

  const blob = await put(file.name, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return blob.url;
}

/**
 * Retrieves all dispute tickets for the currently authenticated student.
 */
export async function getStudentDisputes() {
  const { session } = await requireAuth();

  return prisma.disputeTicket.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Retrieves all dispute tickets across all students.
 * Requires ADMIN role.
 */
export async function getAllDisputes() {
  await requireAdmin();

  return prisma.disputeTicket.findMany({
    include: {
      student: { select: { id: true, name: true, image: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Updates the status (and optionally the resolution) of a dispute ticket.
 * Requires ADMIN role.
 */
export async function updateTicketStatus(id: string, status: TicketStatus, resolution?: string) {
  await requireAdmin();

  const data: Prisma.DisputeTicketUpdateInput = { status };
  
  if (resolution) {
    data.resolution = resolution;
  }
  
  if (status === "RESOLVED") {
    data.resolvedAt = new Date();
  }

  await prisma.disputeTicket.update({
    where: { id },
    data,
  });

  revalidatePath("/disputes");
  revalidatePath("/admin/tickets");
  return { success: true };
}

/**
 * Deletes a dispute ticket and its associated blob attachments.
 * Requires ADMIN role.
 */
export async function deleteDispute(ticketId: string) {
  await requireAdmin();

  // Fetch the ticket first to get its attachments
  const ticket = await prisma.disputeTicket.findUnique({
    where: { id: ticketId },
    select: { attachments: true }
  });

  if (ticket && ticket.attachments.length > 0) {
    // Delete the blobs from Vercel Blob storage to free up space
    try {
      await del(ticket.attachments);
    } catch (err) {
      console.error('Failed to delete blobs from Vercel:', err);
    }
  }

  await prisma.disputeTicket.delete({
    where: { id: ticketId },
  });

  revalidatePath("/disputes");
  revalidatePath("/admin/tickets");
  return { success: true };
}

/**
 * Archives a dispute ticket, keeping it in the database but marking it as archived.
 * Requires ADMIN role.
 */
export async function archiveTicket(id: string) {
  await requireAdmin();

  await prisma.disputeTicket.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/disputes");
  revalidatePath("/admin/tickets");
  return { success: true };
}
