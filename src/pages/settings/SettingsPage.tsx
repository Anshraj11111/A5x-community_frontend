import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { useToast } from '@/store/uiStore';

export default function SettingsPage() {
  const { user, updateUser, clearAuth } = useAuthStore();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    twitter: user?.socialLinks?.twitter || '',
    github: user?.socialLinks?.github || '',
    website: user?.socialLinks?.website || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({
        displayName: profile.displayName,
        bio: profile.bio,
        socialLinks: { twitter: profile.twitter || undefined, github: profile.github || undefined, website: profile.website || undefined },
      });
      updateUser(updated);
      success('Profile updated');
    } catch { error('Failed to update profile'); }
    finally { setIsSaving(false); }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const avatarUrl = await userService.uploadAvatar(file);
      updateUser({ avatarUrl });
      success('Avatar updated');
    } catch { error('Failed to upload avatar'); }
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      await authService.logout();
      clearAuth();
      navigate('/');
    } catch { error('Failed to delete account'); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /><CardTitle className="text-base">Profile</CardTitle></div>
          <CardDescription>Update your public profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Avatar</label>
              <div className="flex items-center gap-3">
                {user?.avatarUrl && <img src={user.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />}
                <label className="cursor-pointer">
                  <span className="text-sm text-primary hover:underline">Change avatar</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Display Name</label>
              <Input value={profile.displayName} onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))} maxLength={50} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Bio</label>
              <Textarea value={profile.bio} onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell the community about yourself..." className="min-h-[80px]" maxLength={300} />
            </div>
            <Separator />
            <p className="text-sm font-medium">Social Links</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Twitter username</label>
                <Input value={profile.twitter} placeholder="yourhandle" onChange={(e) => setProfile(p => ({ ...p, twitter: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">GitHub username</label>
                <Input value={profile.github} placeholder="yourhandle" onChange={(e) => setProfile(p => ({ ...p, github: e.target.value }))} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs text-muted-foreground">Website</label>
                <Input value={profile.website} placeholder="https://yoursite.com" onChange={(e) => setProfile(p => ({ ...p, website: e.target.value }))} />
              </div>
            </div>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><CardTitle className="text-base">Account</CardTitle></div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div><p className="text-sm font-medium">Email</p><p className="text-xs text-muted-foreground">{user?.email}</p></div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div><p className="text-sm font-medium">Username</p><p className="text-xs text-muted-foreground">@{user?.username}</p></div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div><p className="text-sm font-medium">Role</p><p className="text-xs text-muted-foreground capitalize">{user?.role}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2"><Trash2 className="h-4 w-4 text-destructive" /><CardTitle className="text-base text-destructive">Danger Zone</CardTitle></div>
          <CardDescription>Irreversible actions — proceed with caution</CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete Account</Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Yes, delete my account</Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
