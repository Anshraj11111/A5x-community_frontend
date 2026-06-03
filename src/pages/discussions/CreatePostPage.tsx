import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { postService } from '@/services/postService';
import { useToast } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'discussion' | 'question'>('discussion');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) { setTags([...tags, t]); setTagInput(''); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const post = await postService.createPost({ title, content, type, tags });
      success('Post created');
      navigate(`/discussions/${post._id}`);
    } catch (err: unknown) {
      error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to create post');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <div>
        <h1 className="text-2xl font-bold">New Discussion</h1>
        <p className="text-sm text-muted-foreground mt-1">Share your thoughts with the community</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Post type</label>
          <div className="flex gap-2">
            {(['discussion', 'question'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={cn('px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize',
                  type === t ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <Input placeholder="What's on your mind?" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required minLength={5} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Content <span className="text-muted-foreground font-normal">(Markdown supported)</span></label>
          <Textarea placeholder="Write your post here..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[200px]" required minLength={10} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex gap-2">
            <Input placeholder="Add a tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none sm:px-8">
            {isSubmitting ? 'Publishing...' : 'Publish Post'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
