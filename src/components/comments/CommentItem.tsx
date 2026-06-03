import { useState } from 'react';
import { ArrowUp, Reply, Trash2, Edit2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/common/UserAvatar';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { commentService } from '@/services/commentService';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import type { IComment } from '@/types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface CommentItemProps {
  comment: IComment;
  postId: string;
  depth?: number;
}

export function CommentItem({ comment, postId, depth = 0 }: CommentItemProps) {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = user?._id === comment.author._id;

  const handleUpvote = async () => {
    if (!isAuthenticated) return;
    try {
      await commentService.upvoteComment(comment._id);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENTS, postId] });
    } catch { /* handled */ }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await commentService.createComment({ postId, content: replyContent, parentId: comment._id });
      setReplyContent('');
      setIsReplying(false);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENTS, postId] });
    } catch { /* handled */ } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    try {
      await commentService.updateComment(comment._id, editContent);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENTS, postId] });
    } catch { /* handled */ } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await commentService.deleteComment(comment._id);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENTS, postId] });
    } catch { /* handled */ }
  };

  return (
    <div className={cn('flex gap-3', depth > 0 && 'ml-8 pl-4 border-l border-border')}>
      <UserAvatar user={comment.author} size="sm" linkToProfile className="shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{comment.author.displayName}</span>
          <span className="text-xs text-muted-foreground">@{comment.author.username}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px] text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit} disabled={isSubmitting}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className={cn('text-sm', comment.isDeleted && 'text-muted-foreground italic')}>
            {comment.isDeleted ? '[deleted]' : comment.content}
          </p>
        )}

        {!comment.isDeleted && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleUpvote}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors',
                comment.upvotes.includes(user?._id || '')
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ArrowUp className="h-3.5 w-3.5" />
              {comment.voteScore > 0 && comment.voteScore}
            </button>

            {isAuthenticated && depth < 3 && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </button>
            )}

            {isOwner && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors ml-1">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="z-50 min-w-[120px] rounded-lg border border-border bg-card p-1 shadow-lg" align="start">
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md cursor-pointer hover:bg-secondary outline-none"
                      onSelect={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md cursor-pointer hover:bg-destructive/10 text-destructive outline-none"
                      onSelect={handleDelete}
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
          </div>
        )}

        {isReplying && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px] text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReply} disabled={isSubmitting || !replyContent.trim()}>
                Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} postId={postId} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
