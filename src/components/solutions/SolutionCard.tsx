import { Solution } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Code2 } from 'lucide-react';

/**
 * UI Component that represents a single solution item in a list.
 * Displays quiz number, language, title, and posting date.
 * 
 * @param {Solution} solution - The solution data object.
 * @param {boolean} isActive - Styles the card as active if true.
 */
export function SolutionCard({ 
  solution, 
  isActive 
}: { 
  solution: Solution;
  isActive?: boolean;
}) {
  return (
    <Card 
      hoverable 
      className={`cursor-pointer transition-all duration-200 ${isActive ? 'border-[var(--accent-primary)] bg-[var(--bg-tertiary)]' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl text-[var(--accent-primary)] mt-1">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="general">Quiz {solution.labNumber}</Badge>
              <Badge variant="neutral" className="uppercase">{solution.language}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              {solution.title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Posted {formatDistanceToNow(new Date(solution.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="h-full flex items-center pt-4">
          <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? 'text-[var(--accent-primary)] translate-x-1' : 'text-[var(--text-muted)]'}`} />
        </div>
      </div>
    </Card>
  );
}
