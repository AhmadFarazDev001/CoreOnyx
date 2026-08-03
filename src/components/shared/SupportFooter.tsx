import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';

export async function SupportFooter({ className }: { className?: string }) {
  // Fetch the admin's email dynamically for the support footer
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { email: true }
  });
  
  const adminEmail = adminUser?.email || 'support@portal.com';

  return (
    <footer className={cn("w-full py-6 text-center border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] z-50", className)}>
      <p className="text-sm text-[var(--text-secondary)]">
        If any problem occurs in the portal, please email me to this address: <span className="font-medium text-[var(--text-primary)]">{adminEmail}</span>
      </p>
    </footer>
  );
}
