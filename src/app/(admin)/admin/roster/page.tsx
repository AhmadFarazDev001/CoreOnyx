import { getWhitelistWithStatus } from '@/lib/actions/roster';
import { Card } from '@/components/ui/Card';
import { AddStudentModal } from '@/components/admin/AddStudentModal';
import { WhitelistCSVUploader } from '@/components/admin/WhitelistCSVUploader';
import { Search, Filter, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { WhitelistManagementList } from '@/components/admin/WhitelistManagementList';

/**
 * Server Component for the Admin Roster Dashboard.
 * Displays whitelisted emails, allows CSV uploads for bulk whitelisting, and manual student additions.
 */
export default async function AdminRosterPage() {
  const whitelist = await getWhitelistWithStatus();

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-page-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Whitelist Management</h1>
          <p className="text-[var(--text-secondary)]">Manage which student emails are allowed to log into the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2">
            <ShieldCheck className="w-4 h-4" /> Export List
          </Button>
          <WhitelistCSVUploader />
          <AddStudentModal />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-tertiary)]/30">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <Input className="pl-10 h-9" placeholder="Search by email..." />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="secondary" size="sm" className="h-9 w-full sm:w-auto gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        <WhitelistManagementList whitelist={whitelist} />
        
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/30 flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <span>Showing 1 to {whitelist.length} of {whitelist.length} emails</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" disabled>Previous</Button>
            <Button variant="ghost" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
