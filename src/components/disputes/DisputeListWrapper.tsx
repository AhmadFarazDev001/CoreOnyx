'use client';

import { useRouter } from 'next/navigation';
import { DisputeTicket } from '@/lib/types';
import { DisputeList } from './DisputeList';

/**
 * Wrapper for the DisputeList component.
 * Provides routing logic to navigate between dispute tickets in the UI.
 */
export function DisputeListWrapper({ tickets, activeId, basePath }: { tickets: DisputeTicket[], activeId: string, basePath: string }) {
  const router = useRouter();
  
  return (
    <DisputeList 
      tickets={tickets} 
      activeId={activeId} 
      onSelect={(id) => router.push(`${basePath}?id=${id}`, { scroll: false })}
    />
  );
}
