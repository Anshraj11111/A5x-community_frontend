import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentItem } from './CommentItem';
import { InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { postService } from '@/services/postService';
import { commentService } from '@/services/commentService';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import type { IComment } from '@/types';

interface CommentThreadProps {
  postId: string;
  commentCount: number;
}

export function CommentThread({ postId, commentCount }: CommentThreadProps) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.COMMENTS, postId],
    queryFn: () => postService.getPostComments(postId),
  });

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await commentService.createComment({ postId, content: newComment });
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENTS, postId] });
    } catch { /* handled */ } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold">
        {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
      </h2>

      {/* New comment form */}
      {isAuthenticated && (
        <div className="space-y-3">
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !newComment.trim()}
              size="sm"
            >
              Post Comment
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <InlineLoader />
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="Be the first to share your thoughts"
        />
      ) : (
        <div className="space-y-6">
          {data?.data.map((comment: IComment) => (
            <CommentItem key={comment._id} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}
