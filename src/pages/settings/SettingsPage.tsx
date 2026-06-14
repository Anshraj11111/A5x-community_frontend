import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Shield, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { useToast } from '@/store/uiStore';
import { getInitials } from '@/lib/utils';

export default function SettingsPage() {
  const { user, updateUser, clearAuth } = useAuthStore();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    twitter: user?.socialLinks?.twitter || '',
    github: user?.socialLinks?.github || '',
    website: user?.socialLinks?.website || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setIsUploadingAvatar(true);

    try {
      const cloudinaryUrl = await userService.uploadAvatar(file);
      updateUser({ avatarUrl: cloudinaryUrl });
      setAvatarPreview(null); // use the real URL from store now
      success('Profile photo updated!');
    } catch {
      setAvatarPreview(null);
      error('Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input so same file can be re-selected
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // ── Profile save ──────────────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({
        displayName: profile.displayName,
        bio: profile.bio || undefined,
        socialLinks: {
          twitter: profile.twitter || undefined,
          github:  profile.github  || undefined,
          website: profile.website || undefined,
        },
      });
      updateUser(updated);
      success('Profile updated!');
    } catch {
      error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Account delete ────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      await authService.logout();
      clearAuth();
      navigate('/');
    } catch {
      error('Failed to delete account');
    }
  };

  const displayAvatar = avatarPreview ?? user?.avatarUrl;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* ── Profile card ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Profile</CardTitle>
          </div>
          <CardDescription>Update your public profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-5">

            {/* Avatar picker */}
            <div className="flex items-center gap-5">
              <div className="relative group shrink-0">
                <div
                  onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()}
                  className="h-20 w-20 rounded-full overflow-hidden ring-2 ring-border cursor-pointer bg-secondary flex items-center justify-center"
                >
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">
                      {getInitials(user?.displayName || user?.username || '?')}
                    </span>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploadingAvatar
                      ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                      : <Camera className="h-5 w-5 text-white" />}
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Profile Photo</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click the photo to upload a new one.<br />
                  JPG, PNG or WebP · max 5 MB
                </p>
                <button
                  type="button"
                  onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()}
                  className="text-xs text-primary hover:underline mt-1.5 disabled:opacity-50"
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? 'Uploading...' : 'Change photo'}
                </button>
              </div>
            </div>

            <Separator />

            {/* Display name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Display Name</label>
              <Input
                value={profile.displayName}
                onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))}
                maxLength={50}
                required
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Bio <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
              <Textarea
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell the community about yourself..."
                className="min-h-[80px] resize-none"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">{profile.bio.length}/300</p>
            </div>

            <Separator />

            {/* Social links */}
            <p className="text-sm font-medium">Social Links</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Twitter / X username</label>
                <Input
                  value={profile.twitter}
                  placeholder="yourhandle"
                  onChange={e => setProfile(p => ({ ...p, twitter: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">GitHub username</label>
                <Input
                  value={profile.github}
                  placeholder="yourhandle"
                  onChange={e => setProfile(p => ({ ...p, github: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs text-muted-foreground">Website</label>
                <Input
                  value={profile.website}
                  placeholder="https://yoursite.com"
                  onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                />
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Account info card ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <div className="py-3 flex items-center justify-between">
            <div><p className="text-sm font-medium">Email</p><p className="text-xs text-muted-foreground">{user?.email}</p></div>
          </div>
          <div className="py-3 flex items-center justify-between">
            <div><p className="text-sm font-medium">Username</p><p className="text-xs text-muted-foreground">@{user?.username}</p></div>
          </div>
          <div className="py-3 flex items-center justify-between">
            <div><p className="text-sm font-medium">Role</p><p className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p></div>
          </div>
          <div className="py-3 flex items-center justify-between">
            <div><p className="text-sm font-medium">Reputation</p><p className="text-xs text-muted-foreground">{user?.reputation ?? 0} pts</p></div>
          </div>
        </CardContent>
      </Card>

      {/* ── Danger zone ───────────────────────────────────────────────── */}
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>Irreversible actions — proceed with caution</CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Are you sure? This will permanently deactivate your account and cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                  Yes, delete my account
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
