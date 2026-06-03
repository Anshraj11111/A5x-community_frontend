import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostFiltersProps {
  sort: string;
  onSortChange: (sort: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  type?: string;
  onTypeChange?: (type: string) => void;
}

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'top', label: 'Top' },
  { value: 'trending', label: 'Trending' },
];

const typeOptions = [
  { value: '', label: 'All' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'question', label: 'Question' },
  { value: 'announcement', label: 'Announcement' },
];

export function PostFilters({
  sort, onSortChange, search, onSearchChange, type, onTypeChange,
}: PostFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search discussions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
        {sortOptions.map((opt) => (
          <Button
            key={opt.value}
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 px-3 text-xs rounded-md',
              sort === opt.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => onSortChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Type filter */}
      {onTypeChange && (
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {typeOptions.map((opt) => (
            <Button
              key={opt.value}
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 px-3 text-xs rounded-md',
                type === opt.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => onTypeChange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
