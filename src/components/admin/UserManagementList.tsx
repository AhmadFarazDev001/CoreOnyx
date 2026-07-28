'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { toggleUserBlock } from '@/lib/actions/users';
import { useRouter } from 'next/navigation';

/**
 * UserManagementList Component
 * 
 * Displays a list of all registered users in the admin dashboard.
 * Allows administrators to instantly block or unblock users using Server Actions.
 * 
 * @param {any[]} users - Array of user objects fetched from the database containing role, status, etc.
 */
export function UserManagementList({ users }: { users: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    setLoadingId(userId);
    try {
      await toggleUserBlock(userId);
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      alert(error.message || "Failed to update user");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">User Management</h2>
        <p className="text-[var(--text-secondary)] mt-1">Block or manage active users in the system.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-tertiary)]/50 border-b border-[var(--border-subtle)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {users.map((user, idx) => (
              <tr key={user.id} className={`hover:bg-[var(--bg-tertiary)]/30 transition-colors ${idx % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-secondary)]/30'}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full border border-[var(--border-subtle)]" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-muted)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-xs uppercase">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">{user.name}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={user.role === 'ADMIN' ? 'warning' : 'neutral'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </td>
                <td className="px-6 py-4">
                  {user.isBlocked ? (
                    <Badge variant="urgent" icon>Blocked</Badge>
                  ) : (
                    <Badge variant="success" icon>Active</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role !== 'ADMIN' && (
                    <Button 
                      variant={user.isBlocked ? "primary" : "ghost"}
                      size="sm"
                      disabled={loadingId === user.id}
                      onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                      className={user.isBlocked ? "bg-[var(--status-success)] hover:bg-green-600 border-none text-white" : "text-[var(--status-urgent)] hover:text-red-500 hover:bg-red-500/10"}
                    >
                      {loadingId === user.id ? 'Updating...' : user.isBlocked ? (
                        <><ShieldCheck className="w-4 h-4 mr-2" /> Unblock</>
                      ) : (
                        <><ShieldAlert className="w-4 h-4 mr-2" /> Kick / Block</>
                      )}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="p-8 text-center text-[var(--text-muted)] text-sm">
            No users found in the system.
          </div>
        )}
      </div>
    </Card>
  );
}
