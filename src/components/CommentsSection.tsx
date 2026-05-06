import { useState, useEffect } from "react";
import { Send, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface CommentsSectionProps {
  entityType: "contact" | "deal";
  entityId: string | null;
}

export function CommentsSection({ entityType, entityId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const storageKey = entityId ? `startops_comments_${entityType}_${entityId}` : "";

  useEffect(() => {
    if (!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        setComments(JSON.parse(raw));
      } catch {
        setComments([]);
      }
    } else {
      setComments([]);
    }
  }, [storageKey]);

  function addComment() {
    if (!newComment.trim() || !storageKey) return;
    const comment: Comment = {
      id: crypto.randomUUID(),
      text: newComment.trim(),
      author: "You",
      createdAt: new Date().toISOString(),
    };
    const updated = [...comments, comment];
    setComments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewComment("");
    toast.success("Comment added");
  }

  function deleteComment(id: string) {
    const updated = comments.filter((c) => c.id !== id);
    setComments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    toast.success("Comment deleted");
  }

  if (!entityId) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#0b0d10] border border-white/5 group"
          >
            <Avatar className="w-8 h-8 bg-[#6452db]">
              <AvatarFallback className="bg-[#6452db] text-white text-xs">
                {comment.author[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {comment.author}
                  </span>
                  <span className="text-xs text-white/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-[#be6464] transition-opacity p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-white/70 whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-white/40 text-center py-6">
            No comments yet. Start the conversation!
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="bg-[#0b0d10] border-white/10 text-white"
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && addComment()}
        />
        <Button
          onClick={addComment}
          size="sm"
          disabled={!newComment.trim()}
          className="bg-[#6452db] text-white hover:bg-[#6452db]/90 h-9 w-9 p-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}