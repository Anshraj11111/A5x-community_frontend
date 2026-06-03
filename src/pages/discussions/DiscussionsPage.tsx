import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/posts/PostCard';
import { PostFilters } from '@/components/posts/PostFilters';
import { InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { postService } from '@/services/postService';
import { useDebounce } from '@/hooks/useDebounce';
import { QUERY_KEYS } from '@/lib/constants';

export default function DiscussionsPage() {
  const { isAuthenticated } = useAuthStore();
  const [sort, setSort] = useState('latest');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [QUERY_KEYS.POSTS, { sort, type, search: debouncedSearch, page }],
    queryFn: () => postService.getPosts({ sort, type: type || undefined, search: debouncedSearch || undefined, page, limit: 20 }),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discussions</h1>
          <p className="text-sm text-muted-foreground mt-1">Talk about A5X products, share ideas, ask questions</p>
        </div>
        {isAuthenticated && (
          <Button asChild size="sm">
            <Link to="/discussions/new"><Plus className="h-4 w-4 mr-1" /> New Post</Link>
          </Button>
        )}
      </div>

      <PostFilters
        sort={sort} onSortChange={(v) => { setSort(v); setPage(1); }}
        search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
        type={type} onTypeChange={(v) => { setType(v); setPage(1); }}
      />

      {isLoading ? <InlineLoader /> : data?.data.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No discussions found"
          description={search ? 'Try a different search term' : 'Be the first to start a discussion'}
          action={isAuthenticated ? <Button asChild size="sm"><Link to="/discussions/new">Start a Discussion</Link></Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {data?.data.map((post) => <PostCard key={post._id} post={post} />)}
          {data?.pagination?.hasNext && (
            <Button variant="outline" className="w-full" onClick={() => setPage(p => p + 1)} disabled={isFetching}>
              {isFetching ? 'Loading...' : 'Load more'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
