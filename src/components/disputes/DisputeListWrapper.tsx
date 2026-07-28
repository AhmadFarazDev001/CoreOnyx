'use client';

import { useRouter } from 'next/navigation';
import { DisputeTicket } from '@/lib/types';
import { DisputeList } from './DisputeList';

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
