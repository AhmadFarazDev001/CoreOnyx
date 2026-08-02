'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { removeEmailFromWhitelist } from '@/lib/actions/roster';
import { useRouter } from 'next/navigation';

/**
 * WhitelistManagementList Component
 * 
 * Displays all whitelisted emails in a tabular format along with their current system status.
 * Allows administrators to revoke access by removing emails from the whitelist.
 * 
 * @param {any[]} whitelist - Array of whitelist records combined with user login status.
 */
export function WhitelistManagementList({ whitelist }: { whitelist: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemove = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the whitelist? They will no longer be able to log in.`)) {
      return;
    }
    
    setLoadingId(email);
    try {
      await removeEmailFromWhitelist(email);
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      alert(error.message || "Failed to remove email");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-tertiary)]/50 border-b border-[var(--border-subtle)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Added On</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {whitelist.map((record, idx) => (
              <tr key={record.email} className={`hover:bg-[var(--bg-tertiary)]/30 transition-colors ${idx % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-secondary)]/30'}`}>
                <td className="px-6 py-4">
                  <div className="font-medium text-[var(--text-primary)]">{record.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                  {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
                </td>
                <td className="px-6 py-4">
                  {record.isBlocked ? (
                    <Badge variant="urgent" icon>Blocked User</Badge>
                  ) : record.hasLoggedIn ? (
                    record.isOnboarded ? (
                      <Badge variant="success" icon>Active (Logged In)</Badge>
                    ) : (
                      <Badge variant="warning" icon>Onboarding Pending</Badge>
                    )
                  ) : (
                    <Badge variant="neutral">Pending First Login</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    variant="ghost"
                    size="sm"
                    disabled={loadingId === record.email}
                    onClick={() => handleRemove(record.email)}
                    className="text-[var(--status-urgent)] hover:text-red-500 hover:bg-red-500/10"
                  >
                    {loadingId === record.email ? 'Removing...' : (
                      <><Trash2 className="w-4 h-4 mr-2" /> Remove</>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {whitelist.length === 0 && (
          <div className="p-8 text-center text-[var(--text-muted)] text-sm">
            No whitelisted emails found.
          </div>
        )}
      </div>
    </Card>
  );
}
