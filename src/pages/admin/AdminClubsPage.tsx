import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users2, Globe, Lock, Search, Plus, Trash2, ImagePlus, Pencil,
  ArrowLeft, Shield, ShieldOff, Crown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import { clubService } from '@/services/clubService';
import api from '@/services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClubData {
  _id: string; name: string; slug: string; description?: string;
  memberCount?: number; isPrivate?: boolean; createdAt: string;
  coverImage?: string; icon?: string; tags?: string[]; rules?: string[];
  owner?: { _id?: string; username: string; avatarUrl?: string };
}

interface MemberData {
  _id: string;
  role: 'member' | 'moderator' | 'owner';
  joinedAt: string;
  user: {
    _id: string; username: string; displayName: string;
    avatarUrl?: string; isVerified?: boolean; email?: string;
  } | null;
}

interface ClubForm {
  name: string; description: string; isPrivate: boolean; tags: string; rules: string;
}

const EMPTY_FORM: ClubForm = { name: '', description: '', isPrivate: false, tags: '', rules: '' };

const clubToForm = (c: ClubData): ClubForm => ({
  name: c.name, description: c.description ?? '', isPrivate: c.isPrivate ?? false,
  tags: (c.tags ?? []).join(', '), rules: (c.rules ?? []).join('\n'),
});

// ── Shared form fields — defined OUTSIDE to avoid re-mount on keystroke ───────

interface FormFieldsProps {
  form: ClubForm;
  setForm: React.Dispatch<React.SetStateAction<ClubForm>>;
  coverPrev: string | null; iconPrev: string | null;
  coverRef: React.RefObject<HTMLInputElement | null>;
  iconRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'icon') => void;
}

function ClubFormFields({ form, setForm, coverPrev, iconPrev, coverRef, iconRef, onFileChange }: FormFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">Cover Image <span className="text-[#555] font-normal">(optional)</span></label>
        <div onClick={() => coverRef.current?.click()}
          className="h-28 rounded-xl border-2 border-dashed border-[#1a1a1a] hover:border-[#333] bg-[#0d0d0d] cursor-pointer overflow-hidden flex items-center justify-center transition-colors">
          {coverPrev ? <img src={coverPrev} alt="" className="w-full h-full object-cover" />
            : <div className="flex flex-col items-center gap-1 text-[#444]"><ImagePlus className="h-6 w-6" /><span className="text-xs">Click to upload cover</span></div>}
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => onFileChange(e, 'cover')} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">Club Icon <span className="text-[#555] font-normal">(optional)</span></label>
        <div className="flex items-center gap-4">
          <div onClick={() => iconRef.current?.click()}
            className="h-16 w-16 rounded-xl border-2 border-dashed border-[#1a1a1a] hover:border-[#333] bg-[#0d0d0d] cursor-pointer overflow-hidden flex items-center justify-center shrink-0">
            {iconPrev ? <img src={iconPrev} alt="" className="w-full h-full object-cover" /> : <ImagePlus className="h-5 w-5 text-[#444]" />}
          </div>
          <p className="text-xs text-[#555]">Square image.<br />Shown as club avatar.</p>
        </div>
        <input ref={iconRef} type="file" accept="image/*" className="hidden" onChange={e => onFileChange(e, 'icon')} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">Club Name *</label>
        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. A5X Builders" required minLength={2} maxLength={50}
          className="!bg-[#0d0d0d] !border-[#2a2a2a] !text-white placeholder:!text-[#555]" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">Description *</label>
        <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="What is this club about?" required minLength={10} maxLength={1000}
          className="!bg-[#0d0d0d] !border-[#2a2a2a] !text-white placeholder:!text-[#555] min-h-[80px]" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">Tags <span className="text-[#555] font-normal">(comma separated)</span></label>
        <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          placeholder="builders, design, ai"
          className="!bg-[#0d0d0d] !border-[#2a2a2a] !text-white placeholder:!text-[#555]" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">Rules <span className="text-[#555] font-normal">(one per line)</span></label>
        <Textarea value={form.rules} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))}
          placeholder={"Be respectful\nNo spam"}
          className="!bg-[#0d0d0d] !border-[#2a2a2a] !text-white placeholder:!text-[#555] min-h-[70px]" />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Private Club</p>
          <p className="text-xs text-[#555]">{form.isPrivate ? 'Users must request to join' : 'Anyone can join directly'}</p>
        </div>
        <button type="button" onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))}
          className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', form.isPrivate ? 'bg-[#00FF88]' : 'bg-[#333]')}>
          <span className={cn('inline-block h-4 w-4 transform rounded-full bg-black transition-transform', form.isPrivate ? 'translate-x-6' : 'translate-x-1')} />
        </button>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminClubsPage() {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState<ClubData | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<ClubForm>(EMPTY_FORM);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);

  const [editTarget, setEditTarget] = useState<ClubData | null>(null);
  const [editForm, setEditForm] = useState<ClubForm>(EMPTY_FORM);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [editIconFile, setEditIconFile] = useState<File | null>(null);
  const [editIconPreview, setEditIconPreview] = useState<string | null>(null);
  const editCoverRef = useRef<HTMLInputElement>(null);
  const editIconRef = useRef<HTMLInputElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<ClubData | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  // ── Fetch clubs ──────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-clubs', search],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50' };
      if (search) params.search = search;
      const { data } = await api.get('/clubs', { params });
      return data;
    },
  });
  const clubs: ClubData[] = data?.data ?? [];

  // ── Fetch members for selected club ──────────────────────────────────────
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['admin-club-members', selectedClub?.slug],
    queryFn: () => clubService.getClubMembers(selectedClub!.slug, { limit: 100 }),
    enabled: !!selectedClub,
  });
  const members: MemberData[] = membersData?.data ?? [];

  // ── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: object) => api.post('/clubs', payload).then(r => r.data.data.club),
    onSuccess: async (club) => {
      if (coverFile) { const fd = new FormData(); fd.append('cover', coverFile); await api.patch(`/clubs/${club.slug}/cover`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => {}); }
      if (iconFile) { const fd = new FormData(); fd.append('icon', iconFile); await api.patch(`/clubs/${club.slug}/icon`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => {}); }
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      success(`Club "${club.name}" created`);
      setShowCreate(false); setCreateForm(EMPTY_FORM); setCoverFile(null); setCoverPreview(null); setIconFile(null); setIconPreview(null);
    },
    onError: (err: unknown) => toastError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed'),
  });

  const editMutation = useMutation({
    mutationFn: ({ slug, payload }: { slug: string; payload: object }) => api.patch(`/clubs/${slug}`, payload).then(r => r.data.data.club),
    onSuccess: async (club) => {
      if (editCoverFile) { const fd = new FormData(); fd.append('cover', editCoverFile); await api.patch(`/clubs/${club.slug}/cover`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => {}); }
      if (editIconFile) { const fd = new FormData(); fd.append('icon', editIconFile); await api.patch(`/clubs/${club.slug}/icon`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => {}); }
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      if (selectedClub?.slug === club.slug) setSelectedClub(prev => prev ? { ...prev, ...club } : null);
      success(`Club "${club.name}" updated`);
      setEditTarget(null);
    },
    onError: (err: unknown) => toastError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => api.delete(`/clubs/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      success('Club deleted');
      setDeleteTarget(null);
      setSelectedClub(null);
    },
    onError: () => toastError('Failed to delete'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'icon', mode: 'create' | 'edit' = 'create') => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = URL.createObjectURL(file);
    if (mode === 'create') { type === 'cover' ? (setCoverFile(file), setCoverPreview(url)) : (setIconFile(file), setIconPreview(url)); }
    else { type === 'cover' ? (setEditCoverFile(file), setEditCoverPreview(url)) : (setEditIconFile(file), setEditIconPreview(url)); }
  };

  const handlePromote = async (member: MemberData) => {
    if (!selectedClub || !member.user) return;
    const newRole = member.role === 'moderator' ? 'member' : 'moderator';
    setPromotingId(member.user._id);
    try {
      await clubService.updateMemberRole(selectedClub.slug, member.user._id, newRole);
      success(newRole === 'moderator' ? `${member.user.displayName} is now a club admin` : `${member.user.displayName} demoted to member`);
      queryClient.invalidateQueries({ queryKey: ['admin-club-members', selectedClub.slug] });
    } catch (err: unknown) {
      toastError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed');
    } finally {
      setPromotingId(null);
    }
  };

  // ── Club detail view ──────────────────────────────────────────────────────
  if (selectedClub) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <button onClick={() => setSelectedClub(null)} className="flex items-center gap-2 text-sm text-[#666] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Clubs
        </button>

        {/* Club header */}
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-[#111] to-[#0d0d0d]">
            {selectedClub.coverImage && <img src={selectedClub.coverImage} alt="" className="w-full h-full object-cover" />}
            <div className={cn('absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
              selectedClub.isPrivate ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' : 'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20')}>
              {selectedClub.isPrivate ? <><Lock className="h-2.5 w-2.5" /> Private</> : <><Globe className="h-2.5 w-2.5" /> Public</>}
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-2 -mt-8">
              <div className="h-14 w-14 rounded-xl bg-indigo-400/10 border-2 border-[#0d0d0d] ring-2 ring-[#1a1a1a] flex items-center justify-center overflow-hidden shrink-0">
                {selectedClub.icon ? <img src={selectedClub.icon} alt="" className="w-full h-full object-cover" /> : <Users2 className="h-7 w-7 text-indigo-400" />}
              </div>
              <div className="pt-6">
                <p className="text-lg font-bold text-white">{selectedClub.name}</p>
                <p className="text-xs text-[#444]">/{selectedClub.slug}</p>
              </div>
            </div>
            {selectedClub.description && <p className="text-sm text-[#666] mb-3">{selectedClub.description}</p>}
            <div className="flex items-center gap-4 text-xs text-[#444]">
              <span className="flex items-center gap-1"><Users2 className="h-3.5 w-3.5" />{formatNumber(selectedClub.memberCount ?? 0)} members</span>
              {selectedClub.owner && <span>Owner: <span className="text-[#666]">@{selectedClub.owner.username}</span></span>}
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="border-[#2a2a2a] text-white hover:bg-[#111] gap-1.5"
                onClick={() => { setEditTarget(selectedClub); setEditForm(clubToForm(selectedClub)); setEditCoverPreview(selectedClub.coverImage ?? null); setEditIconPreview(selectedClub.icon ?? null); }}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5"
                onClick={() => setDeleteTarget(selectedClub)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete Club
              </Button>
            </div>
          </div>
        </div>

        {/* Members list */}
        <div>
          <h2 className="text-base font-bold text-white mb-3">
            Members <span className="text-[#444] font-normal text-sm">({members.length})</span>
          </h2>

          {membersLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] animate-pulse" />)}</div>
          ) : members.length === 0 ? (
            <p className="text-sm text-[#555]">No members yet.</p>
          ) : (
            <div className="space-y-2">
              {members.map(member => {
                // Guard: skip if user was deleted
                if (!member.user) return null;

                return (
                  <div key={member._id} className="flex items-center justify-between rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user.username}`}
                        alt="" className="h-8 w-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{member.user.displayName}</p>
                        <p className="text-xs text-[#444]">@{member.user.username} · joined {formatRelativeTime(member.joinedAt)}</p>
                        {member.user.email && (
                          <a href={`mailto:${member.user.email}`}
                            className="text-xs text-[#00FF88]/70 hover:text-[#00FF88] transition-colors">
                            {member.user.email}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {member.role === 'owner' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20">
                          <Crown className="h-2.5 w-2.5" /> Owner
                        </span>
                      )}
                      {member.role === 'moderator' && (
                        <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                          <Shield className="h-2.5 w-2.5 mr-1" /> Club Admin
                        </Badge>
                      )}
                      {member.role !== 'owner' && (
                        <Button size="sm" variant="outline"
                          disabled={promotingId === member.user._id}
                          onClick={() => handlePromote(member)}
                          className={cn('h-7 text-xs gap-1',
                            member.role === 'moderator'
                              ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                              : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
                          )}
                        >
                          {promotingId === member.user._id ? '...' : member.role === 'moderator'
                            ? <><ShieldOff className="h-3.5 w-3.5" /> Remove Admin</>
                            : <><Shield className="h-3.5 w-3.5" /> Make Admin</>}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Edit dialog */}
        <Dialog open={!!editTarget} onOpenChange={o => { if (!o) setEditTarget(null); }}>
          <DialogContent className="max-w-lg !bg-[#0a0a0a] !border-[#1a1a1a] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Club</DialogTitle>
              <DialogDescription className="text-[#666]">Update club information.</DialogDescription>
            </DialogHeader>
            <form onSubmit={e => {
              e.preventDefault();
              if (editTarget) editMutation.mutate({ slug: editTarget.slug, payload: { name: editForm.name.trim(), description: editForm.description.trim(), isPrivate: editForm.isPrivate, tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean), rules: editForm.rules.split('\n').map(r => r.trim()).filter(Boolean) } });
            }} className="space-y-4 mt-2">
              <ClubFormFields form={editForm} setForm={setEditForm} coverPrev={editCoverPreview} iconPrev={editIconPreview} coverRef={editCoverRef} iconRef={editIconRef} onFileChange={(e, t) => handleFileChange(e, t, 'edit')} />
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditTarget(null)} className="border-[#2a2a2a] text-white hover:bg-[#111]">Cancel</Button>
                <Button type="submit" disabled={editMutation.isPending} className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90">
                  {editMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete confirm */}
        <Dialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null); }}>
          <DialogContent className="max-w-sm !bg-[#0a0a0a] !border-[#1a1a1a]">
            <DialogHeader>
              <DialogTitle className="text-white">Delete Club</DialogTitle>
              <DialogDescription className="text-[#666]">Delete <span className="text-white font-medium">"{deleteTarget?.name}"</span>? This cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-[#2a2a2a] text-white hover:bg-[#111]">Cancel</Button>
              <Button onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.slug)} disabled={deleteMutation.isPending} className="bg-red-500 text-white hover:bg-red-600">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Club list view ────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Product Clubs</h1>
          <p className="text-sm text-[#666] mt-0.5">{clubs.length} clubs · click to manage members</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90 gap-1.5" size="sm">
          <Plus className="h-4 w-4" /> Create Club
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#444]" />
        <Input placeholder="Search clubs..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 !bg-[#0d0d0d] !border-[#1a1a1a] !text-white placeholder:!text-[#444]" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] animate-pulse h-48" />)}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center text-sm text-red-400">Failed to load clubs.</div>
      ) : clubs.length === 0 ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-10 text-center">
          <Users2 className="h-8 w-8 text-[#444] mx-auto mb-3" />
          <p className="text-sm text-[#666] mb-4">No clubs yet</p>
          <Button size="sm" onClick={() => setShowCreate(true)} className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90"><Plus className="h-4 w-4 mr-1" /> Create First Club</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(club => (
            <div key={club._id} onClick={() => setSelectedClub(club)}
              className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden hover:border-[#00FF88]/30 cursor-pointer transition-all group">
              <div className="relative h-24 bg-gradient-to-br from-[#111] to-[#0d0d0d]">
                {club.coverImage && <img src={club.coverImage} alt="" className="w-full h-full object-cover" />}
                <div className={cn('absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                  club.isPrivate ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' : 'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20')}>
                  {club.isPrivate ? <><Lock className="h-2.5 w-2.5" /> Private</> : <><Globe className="h-2.5 w-2.5" /> Public</>}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-indigo-400/10 border border-[#1a1a1a] flex items-center justify-center shrink-0 overflow-hidden -mt-7 ring-2 ring-[#0d0d0d]">
                    {club.icon ? <img src={club.icon} alt="" className="w-full h-full object-cover" /> : <Users2 className="h-5 w-5 text-indigo-400" />}
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-[#00FF88] transition-colors">{club.name}</p>
                    <p className="text-[10px] text-[#444]">/{club.slug}</p>
                  </div>
                </div>
                {club.description && <p className="text-xs text-[#666] line-clamp-2 mb-3">{club.description}</p>}
                <div className="flex items-center justify-between text-xs text-[#444]">
                  <span className="flex items-center gap-1"><Users2 className="h-3 w-3" />{formatNumber(club.memberCount ?? 0)} members</span>
                  <span>{formatRelativeTime(club.createdAt)}</span>
                </div>
                {club.owner && (
                  <div className="mt-3 pt-3 border-t border-[#111] flex items-center gap-2">
                    <img src={club.owner.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${club.owner.username}`} alt="" className="h-5 w-5 rounded-full" />
                    <span className="text-[10px] text-[#444]">Owner: <span className="text-[#666]">@{club.owner.username}</span></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={o => { if (!o) { setShowCreate(false); setCreateForm(EMPTY_FORM); setCoverFile(null); setCoverPreview(null); setIconFile(null); setIconPreview(null); } }}>
        <DialogContent className="max-w-lg !bg-[#0a0a0a] !border-[#1a1a1a] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Club</DialogTitle>
            <DialogDescription className="text-[#666]">Set up a new product club.</DialogDescription>
          </DialogHeader>
          <form onSubmit={e => {
            e.preventDefault();
            createMutation.mutate({ name: createForm.name.trim(), description: createForm.description.trim(), isPrivate: createForm.isPrivate, tags: createForm.tags.split(',').map(t => t.trim()).filter(Boolean), rules: createForm.rules.split('\n').map(r => r.trim()).filter(Boolean) });
          }} className="space-y-4 mt-2">
            <ClubFormFields form={createForm} setForm={setCreateForm} coverPrev={coverPreview} iconPrev={iconPreview} coverRef={coverRef} iconRef={iconRef} onFileChange={(e, t) => handleFileChange(e, t, 'create')} />
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="border-[#2a2a2a] text-white hover:bg-[#111]">Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90">
                {createMutation.isPending ? 'Creating...' : 'Create Club'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
