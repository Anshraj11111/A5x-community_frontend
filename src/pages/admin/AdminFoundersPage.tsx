import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Plus, Trash2, Eye, EyeOff, X, AlertCircle, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import api from '@/services/api';

const UPDATE_TYPES = ['feature', 'bugfix', 'improvement', 'breaking'] as const;
type UpdateType = typeof UPDATE_TYPES[number];

const TYPE_COLORS: Record<UpdateType, string> = {
  feature:     'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20',
  bugfix:      'text-red-400 bg-red-400/10 border-red-400/20',
  improvement: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  breaking:    'text-orange-400 bg-orange-400/10 border-orange-400/20',
};

const EMPTY_FORM = { title: '', content: '', version: '', type: 'feature' as UpdateType };
const MAX_IMAGES = 5;

export default function AdminFoundersPage() {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // fetch
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-updates'],
    queryFn: async () => {
      const res = await api.get('/updates', { params: { limit: 20 } });
      return res.data;
    },
    retry: false,
  });

  const updates: any[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];

  // image helpers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const toAdd = files.slice(0, MAX_IMAGES - imageFiles.length);
    setImageFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setImageFiles([]);
    setImagePreviews([]);
  };

  // mutations
  const createMutation = useMutation({
    mutationFn: async ({ publish }: { publish: boolean }) => {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('content', form.content);
      fd.append('version', form.version);
      fd.append('type', form.type);
      fd.append('isPublished', String(publish));
      imageFiles.forEach(f => fd.append('images', f));
      const res = await api.post('/updates', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-updates'] });
      success('Update saved successfully');
      resetForm();
      setShowForm(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to save update';
      toastError(msg);
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      await api.patch(`/updates/${id}`, { isPublished });
    },
    onSuccess: (_, { isPublished }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-updates'] });
      success(isPublished ? 'Published' : 'Moved to drafts');
    },
    onError: () => toastError('Failed to update publish status'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/updates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-updates'] });
      success('Update deleted');
    },
    onError: () => toastError('Failed to delete update'),
  });

  // validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim())   errors.title   = 'Title is required';
    if (!form.version.trim()) errors.version = 'Version is required (e.g. v1.0.0)';
    if (!form.content.trim()) errors.content = 'Content is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (publish: boolean) => {
    if (!validate()) return;
    createMutation.mutate({ publish });
  };

  const loadError = (error as any)?.response?.data?.error?.message
    || (error as any)?.message
    || 'Failed to load updates. Make sure the backend is running.';

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Founder's Desk</h1>
          <p className="text-sm text-[#666] mt-0.5">Product updates, changelogs, and announcements</p>
        </div>
        <Button
          size="sm"
          onClick={() => { setShowForm(v => !v); resetForm(); }}
          className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90 gap-1.5">
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? 'Cancel' : 'New Update'}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl border border-[#00FF88]/20 bg-[#0d0d0d] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">New Product Update</h2>
          <div className="space-y-4">
            {/* Title + Version */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#888]">Title <span className="text-red-400">*</span></label>
                <Input
                  value={form.title}
                  onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setFormErrors(fe => ({ ...fe, title: '' })); }}
                  placeholder="What's new?"
                  className={cn('bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#444]', formErrors.title && 'border-red-400/50')}
                />
                {formErrors.title && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{formErrors.title}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#888]">Version <span className="text-red-400">*</span></label>
                <Input
                  value={form.version}
                  onChange={e => { setForm(f => ({ ...f, version: e.target.value })); setFormErrors(fe => ({ ...fe, version: '' })); }}
                  placeholder="e.g. v2.4.1"
                  className={cn('bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#444]', formErrors.version && 'border-red-400/50')}
                />
                {formErrors.version && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{formErrors.version}</p>}
              </div>
            </div>

            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Type</label>
              <div className="flex gap-2 flex-wrap">
                {UPDATE_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all',
                      form.type === t ? TYPE_COLORS[t] : 'text-[#444] border-[#222] bg-[#111] hover:border-[#333]'
                    )}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Content <span className="text-red-400">*</span></label>
              <Textarea
                value={form.content}
                onChange={e => { setForm(f => ({ ...f, content: e.target.value })); setFormErrors(fe => ({ ...fe, content: '' })); }}
                placeholder="Describe the changes... Markdown supported."
                className={cn('bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#444] min-h-[140px] text-xs', formErrors.content && 'border-red-400/50')}
              />
              {formErrors.content && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{formErrors.content}</p>}
            </div>

            {/* Image upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">
                Images <span className="text-[#555]">(optional, max {MAX_IMAGES})</span>
              </label>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-[#222]">
                      <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imageFiles.length < MAX_IMAGES && (
                <>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple className="hidden" onChange={handleImageSelect} />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#333] text-[#555] hover:border-[#00FF88]/40 hover:text-[#00FF88] transition-colors text-xs">
                    <ImagePlus className="h-3.5 w-3.5" />
                    Add images ({imageFiles.length}/{MAX_IMAGES})
                  </button>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <Button type="button" size="sm" variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={createMutation.isPending}
                className="border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444]">
                {createMutation.isPending ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button type="button" size="sm"
                onClick={() => handleSubmit(true)}
                disabled={createMutation.isPending}
                className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90">
                {createMutation.isPending ? 'Publishing...' : 'Publish Now'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Updates list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Failed to load updates</p>
              <p className="text-xs text-[#666] mt-1">{loadError}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}
              className="border-[#2a2a2a] text-[#888] hover:text-white shrink-0">
              Retry
            </Button>
          </div>
        </div>
      ) : updates.length === 0 ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
          <Zap className="h-8 w-8 text-[#444] mx-auto mb-3" />
          <p className="text-sm text-white mb-1">No updates yet</p>
          <p className="text-xs text-[#666]">Click "New Update" to create the first product update.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((update: any) => (
            <div key={update._id} className={cn(
              'rounded-xl border bg-[#0d0d0d] p-5 transition-all',
              update.isPublished ? 'border-[#1a1a1a] hover:border-[#2a2a2a]' : 'border-dashed border-[#222]'
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-white">{update.title}</h3>
                    <span className="text-[10px] font-mono text-[#666] border border-[#222] px-1.5 py-0.5 rounded">
                      {update.version}
                    </span>
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize',
                      TYPE_COLORS[update.type as UpdateType] || TYPE_COLORS.feature
                    )}>
                      {update.type}
                    </span>
                    {!update.isPublished && (
                      <span className="text-[10px] font-semibold text-[#555] bg-[#111] border border-[#222] px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666] line-clamp-2">{update.content}</p>
                  {update.images?.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {update.images.map((img: string, i: number) => (
                        <img key={i} src={img} alt={`img-${i}`}
                          className="w-12 h-12 rounded object-cover border border-[#222]" />
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-[#444] mt-2">
                    {update.author?.displayName ?? 'Unknown'} · {formatRelativeTime(update.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePublishMutation.mutate({ id: update._id, isPublished: !update.isPublished })}
                    disabled={togglePublishMutation.isPending}
                    className={cn('p-1.5 rounded-lg transition-colors',
                      update.isPublished
                        ? 'text-[#00FF88] hover:bg-[#00FF88]/10'
                        : 'text-[#444] hover:text-[#00FF88] hover:bg-[#00FF88]/10'
                    )}
                    title={update.isPublished ? 'Unpublish' : 'Publish'}>
                    {update.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Delete this update?')) deleteMutation.mutate(update._id); }}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-lg text-[#444] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
