import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, MessageSquare, Lightbulb, Layers, Users,
  Zap, TrendingUp, Calendar, Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PostCard } from '@/components/posts/PostCard';
import { InlineLoader } from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { postService } from '@/services/postService';
import { QUERY_KEYS } from '@/lib/constants';

const quickLinks = [
  { label: "Founder's Desk",  icon: Zap,          href: '/founders-desk', color: 'text-[#00FF88]' },
  { label: 'Discussions',     icon: MessageSquare, href: '/discussions',   color: 'text-blue-400' },
  { label: 'Events',          icon: Calendar,      href: '/events',        color: 'text-purple-400' },
  { label: 'Feature Requests',icon: Lightbulb,     href: '/features',      color: 'text-cyan-400' },
  { label: 'Showcase',        icon: Layers,        href: '/showcase',      color: 'text-pink-400' },
  { label: 'Bug Reports',     icon: TrendingUp,    href: '/bugs',          color: 'text-red-400' },
  { label: 'Product Journey', icon: Map,           href: '/journey',       color: 'text-indigo-400' },
  { label: 'Notifications',   icon: Users,         href: '/notifications', color: 'text-orange-400' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  const { data: trendingPosts, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.POSTS, 'trending-home'],
    queryFn: () => postService.getPosts({ sort: 'trending', limit: 5 }),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="text-center space-y-5 py-8">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-[0_0_30px_rgba(0,255,136,0.3)]">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              A5X Community
            </span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            The home for A5X product enthusiasts. Discuss, build, and shape the future of A5X together.
          </p>
        </div>
        {!isAuthenticated ? (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" asChild><Link to="/register">Join the Community</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/discussions">Browse Discussions</Link></Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" asChild><Link to="/discussions/new">Start a Discussion</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/features">Feature Requests</Link></Button>
          </div>
        )}
      </section>

      {/* ── QUICK NAV ────────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {quickLinks.map(({ label, icon: Icon, href, color }) => (
            <Link key={href} to={href}>
              <Card className="transition-all duration-200 hover:border-border/80 hover:bg-secondary/50 cursor-pointer">
                <CardContent className="flex flex-col items-center gap-1.5 py-4 px-2 text-center">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="text-[10px] font-medium text-muted-foreground leading-tight">{label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOUNDER'S DESK BANNER ────────────────────────────────────── */}
      <section>
        <Link to="/founders-desk">
          <div className="relative rounded-2xl border border-[#00FF88]/20 bg-gradient-to-br from-[#00FF88]/5 via-card to-card p-6 overflow-hidden hover:border-[#00FF88]/40 transition-all duration-200 group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#00FF88]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00FF88]">
                    <Zap className="h-3.5 w-3.5 text-black" />
                  </div>
                  <span className="text-xs font-bold text-[#00FF88] uppercase tracking-widest">Founder's Desk</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/20 uppercase">New</span>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-[#00FF88] transition-colors">
                  Direct from the people building A5X
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Voice notes, roadmap updates, AMA sessions, polls, and honest behind-the-scenes posts from our founders.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-[#00FF88] shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </section>

      {/* ── TRENDING DISCUSSIONS ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Trending Discussions</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/discussions" className="flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {isLoading ? <InlineLoader /> : isError ? (
          <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">Backend server is offline.</p>
            <p className="text-xs text-muted-foreground mt-1">Start the API server to see live discussions.</p>
          </div>
        ) : !trendingPosts?.data?.length ? (
          <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">No discussions yet. Be the first to start one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trendingPosts.data.map((post) => (
              <PostCard key={post._id} post={post} compact />
            ))}
          </div>
        )}
      </section>

      {/* ── UPCOMING EVENTS BANNER ───────────────────────────────────── */}
      <section>
        <Link to="/events">
          <div className="relative rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card to-card p-6 overflow-hidden hover:border-blue-500/40 transition-all duration-200 group">
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
                    <Calendar className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Community Events</span>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-blue-400 transition-colors">
                  AMAs, Workshops & Community Calls
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Join live sessions with the A5X founders and community.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-400 shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </section>

      {/* ── JOIN CTA ─────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-6">
              <div>
                <h3 className="font-semibold text-base">Ready to join?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your account, follow founders, and start contributing to A5X.
                </p>
              </div>
              <Button asChild className="shrink-0"><Link to="/register">Get started free</Link></Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
