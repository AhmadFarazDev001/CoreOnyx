import { Badge } from '@/components/ui/Badge';

import { AnnouncementPriority } from '@prisma/client';

/**
 * Helper component to render a standardized badge for announcement priorities.
 * Maps priority enums to specific UI badge variants.
 * 
 * @param {AnnouncementPriority} priority - The priority level of the announcement.
 */
export function PriorityBadge({ priority }: { priority: AnnouncementPriority }) {
  if (priority === 'URGENT') {
    return <Badge variant="urgent" icon>Urgent</Badge>;
  }
  return <Badge variant="general" icon>General</Badge>;
}
