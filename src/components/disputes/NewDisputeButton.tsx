'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { NewDisputeModal } from './NewDisputeModal';

export function NewDisputeButton({ 
  className,
  variant = 'primary',
  size,
  showLabel = true,
}: { 
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={className} 
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="w-4 h-4" />
        {showLabel && 'New Ticket'}
      </Button>
      
      <NewDisputeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
