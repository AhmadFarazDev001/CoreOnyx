"use server";

import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

import { requireAdmin } from "@/lib/auth-guard";

export async function cleanupArchivedTickets() {
  await requireAdmin();
  // Find tickets that have been ARCHIVED for more than 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const oldTickets = await prisma.disputeTicket.findMany({
    where: {
      status: "ARCHIVED",
      updatedAt: {
        lt: ninetyDaysAgo,
      },
    },
  });

  let deletedBlobs = 0;

  for (const ticket of oldTickets) {
    if (ticket.attachments && ticket.attachments.length > 0) {
      try {
        // Delete attachments from Vercel Blob
        await del(ticket.attachments);
        deletedBlobs += ticket.attachments.length;

        // Clear attachments array from DB
        await prisma.disputeTicket.update({
          where: { id: ticket.id },
          data: { attachments: [] },
        });
      } catch (error) {
        console.error(`Failed to delete attachments for ticket ${ticket.id}:`, error);
      }
    }
  }

  return { success: true, deletedBlobs };
}
