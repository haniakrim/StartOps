import { useState, useEffect } from "react";
import { Send, Clock, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";

interface Comment {
  id: string;
  text: string;
  author_name: string;
  user_id: string | null;
  created_at: string;
}

interface CommentsSectionProps {
  entityType: "contact" | "deal";
  entityId: string | null;
}

export function CommentsSection({ entityType, entityId }: CommentsSectionProps) {
  const { user, profile } = useAuth();
  const { organizationId } = useOrganization();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const authorName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "You"
    : "You";

  useEffect(() => {
    if (entityId) fetchComments();
  }, [entityId]);

  async function fetchComments() {
    if (!entityId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      toast.error("Failed to load comments: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addComment() {
    if (!newComment.trim() || !entityId) return;
    if (!organizationId) {
      toast.error("No organization found");
      return;
    }
    try {
      const { error } = await supabase.from("comments").insert({
        entity_type: entityType,
        entity_id: entityId,
        text: newComment.trim(),
        author_name: authorName,
        user_id: user?.id || null,
        organization_id: organizationId,
      });

      if (error) throw error;
      setNewComment("");
      toast.success("Comment added");
      fetchComments();
    } catch (error: any) {
      toast.error("Failed to add comment: " + error.message);
    }
  }

  async function deleteComment(id: string) {
    try {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Comment deleted");
      fetchComments();
    } catch (error: any) {
      toast.error("Failed to delete comment: " + error.message);
    }
  }

  if (!entityId) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border group"
          >
            <Avatar className="w-8 h-8 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {comment.author_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {comment.author_name}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No comments yet. Start the conversation!
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="bg-muted border-border"
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && addComment()}
        />
        <Button
          onClick={addComment}
          size="sm"
          disabled={!newComment.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9 p-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}