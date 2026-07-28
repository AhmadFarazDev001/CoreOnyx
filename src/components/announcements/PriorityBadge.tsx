import { Badge } from '@/components/ui/Badge';

import { AnnouncementPriority } from '@prisma/client';

export function PriorityBadge({ priority }: { priority: AnnouncementPriority }) {
  if (priority === 'URGENT') {
    return <Badge variant="urgent" icon>Urgent</Badge>;
  }
  return <Badge variant="general" icon>General</Badge>;
}
