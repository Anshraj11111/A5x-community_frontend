import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layers, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/common/UserAvatar';
import { InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { showcaseService } from '@/services/showcaseService';
import { cn, formatNumber } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import type { IShowcasePost } from '@/types';

export default function ShowcasePage() {
  const { isAuthenticated } = useAuthStore();
  const [sort, setSort] = useState('latest');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SHOWCASE, { sort }],
    queryFn: () => showcaseService.getShowcasePosts({ sort, limit: 24 }),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Showcase</h1>
          <p className="text-sm text-muted-foreground mt-1">Projects and builds from the A5X community</p>
        </div>
        {isAuthenticated && <Button size="sm" asChild><Link to="/showcase/new">Share Project</Link></Button>}
      </div>

      <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 w-fit">
        {['latest', 'top'].map((s) => (
          <Button key={s} variant="ghost" size="sm" className={cn('h-7 px-3 text-xs rounded-md capitalize', sort === s ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')} onClick={() => setSort(s)}>{s}</Button>
        ))}
      </div>

      {isLoading ? <InlineLoader /> : data?.data.length === 0 ? (
        <EmptyState icon={Layers} title="No showcase posts yet" description="Be the first to share your project"
          action={isAuthenticated ? <Button size="sm" asChild><Link to="/showcase/new">Share a Project</Link></Button> : undefined} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map((item: IShowcasePost) => (
            <Link key={item._id} to={`/showcase/${item._id}`}>
              <Card className="transition-all duration-200 hover:border-border/80 hover:bg-secondary/50 overflow-hidden cursor-pointer h-full flex flex-col">
                <div className="relative aspect-video bg-secondary overflow-hidden">
                  {item.images[0] ? <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><Layers className="h-8 w-8 text-muted-foreground/30" /></div>}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">{item.description}</p>
                  {item.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{item.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}</div>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5"><UserAvatar user={item.author} size="xs" /><span className="text-xs text-muted-foreground">{item.author.displayName}</span></div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUp className="h-3 w-3" /> {formatNumber(item.voteScore)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
