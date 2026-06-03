import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { Link as LinkIcon, Twitter, Github, Calendar, Award, MessageSquare, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/posts/PostCard';
import { UserAvatar } from '@/components/common/UserAvatar';
import { PageLoader, InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { formatDate, formatNumber } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import { useToast } from '@/store/uiStore';

const TABS = ['Posts', 'Badges'] as const;
type Tab = typeof TABS[number];

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const { updateUser } = useAuthStore();
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('Posts');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const avatarUrl = await userService.uploadAvatar(file);
      updateUser({ avatarUrl });
      success('Profile photo updated!');
    } catch {
      toastError('Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PROFILE, username],
    queryFn: () => userService.getProfile(username!),
    enabled: !!username,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER_POSTS, username],
    queryFn: () => userService.getUserPosts(username!, { limit: 20 }),
    enabled: !!username && activeTab === 'Posts',
  });

  if (isLoading) return <PageLoader />;
  if (!profile) return <div className="text-center py-16 text-muted-foreground">User not found.</div>;

  const isOwnProfile = currentUser?.username === username;
  const socialLinks = profile.socialLinks as { twitter?: string; github?: string; website?: string } | undefined;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-primary/20 via-secondary to-background relative">
          {(profile as { coverImageUrl?: string }).coverImageUrl && (
            <img src={(profile as { coverImageUrl?: string }).coverImageUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="relative group">
              <UserAvatar user={profile} size="xl" className="ring-4 ring-background rounded-full" />
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {isOwnProfile && (
              <Button variant="outline" size="sm" asChild><a href="/settings">Edit Profile</a></Button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{profile.displayName}</h1>
              {profile.isVerified && <Badge variant="default" className="text-[10px]">Verified</Badge>}
              {profile.role !== 'user' && <Badge variant="secondary" className="text-[10px] capitalize">{profile.role}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="text-sm">{profile.bio}</p>}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined {formatDate(profile.createdAt)}</span>
              <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-primary" /> {formatNumber(profile.reputation)} reputation</span>
              {socialLinks?.twitter && (
                <a href={`https://twitter.com/${socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Twitter className="h-3.5 w-3.5" /> @{socialLinks.twitter}
                </a>
              )}
              {socialLinks?.github && (
                <a href={`https://github.com/${socialLinks.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Github className="h-3.5 w-3.5" /> {socialLinks.github}
                </a>
              )}
              {socialLinks?.website && (
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <LinkIcon className="h-3.5 w-3.5" /> Website
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Posts' && (
        postsLoading ? <InlineLoader /> : postsData?.data.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No posts yet" />
        ) : (
          <div className="space-y-3">
            {postsData?.data.map((post) => <PostCard key={post._id} post={post} compact />)}
          </div>
        )
      )}

      {activeTab === 'Badges' && (
        profile.badges.length === 0 ? (
          <EmptyState icon={Award} title="No badges yet" description="Earn badges by contributing to the community" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(profile.badges as unknown as Array<{ _id: string; name: string; icon: string; tier: string }>).map((badge) => (
              <Card key={badge._id} className="p-4 flex items-center gap-3">
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="text-sm font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{badge.tier}</p>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
