import { useEffect, useState } from "react";
import {
  getVideoComments,
  addComment,
  deleteComment,
  editComment,
} from "../api/comment.api";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../stores/auth.store";
import { formatTimeAgo } from "../utils/formatViews";
import { toast } from "react-toastify";
import { FiMessageSquare, FiEdit2, FiTrash2, FiUser, FiSend } from "react-icons/fi";

/**
 * CommentsSection Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Designer video comment threads:
 * 1. User avatar input field with gold focus ring and sleek action buttons.
 * 2. Instant updates on adding, editing, and deleting comments.
 * 3. Humanized relative timestamps (e.g. "3h ago").
 */
const CommentsSection = ({ videoId }) => {
  const currentUser = useAuthStore((s) => s.user);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm();
  const newCommentContent = watch("content", "");

  // Submit new comment
  const submitHandler = async ({ content }) => {
    if (submitting || !content.trim()) return;
    setSubmitting(true);

    try {
      await addComment(videoId, content.trim());
      const res = await getVideoComments(videoId);
      setComments(res.data.data || []);
      reset();
      setIsInputFocused(false);
      toast.success("Comment posted!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch comments on mount or video change
  useEffect(() => {
    setLoading(true);
    setError(null);

    getVideoComments(videoId)
      .then((res) => setComments(res?.data?.data || []))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load comments"))
      .finally(() => setLoading(false));
  }, [videoId]);

  // Delete comment handler
  const deleteHandler = (commentId) => async () => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.info("Comment deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
    }
  };

  // Start editing a comment
  const startEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  // Save edited comment
  const saveEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const res = await editComment(commentId, editContent.trim());
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.data.data : c))
      );
      setEditingCommentId(null);
      setEditContent("");
      toast.success("Comment updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update comment");
    }
  };

  return (
    <section className="mt-8 flex flex-col gap-6" aria-label="Comments">
      {/* Comments Header */}
      <div className="flex items-center gap-2">
        <FiMessageSquare className="text-amber-400 text-lg" />
        <h3 className="text-lg font-bold text-white tracking-tight m-0">
          {comments.length} {comments.length === 1 ? "Discussion" : "Discussions"}
        </h3>
      </div>

      {/* Add New Comment Box */}
      <form className="flex items-start gap-3.5" onSubmit={handleSubmit(submitHandler)}>
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10 bg-zinc-900">
          {currentUser?.avatar ? (
            <img className="w-full h-full object-cover" src={currentUser.avatar} alt="You" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-400 text-xs font-bold">
              <FiUser />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <textarea
            className="w-full bg-[#121215] text-zinc-100 placeholder-zinc-500 px-4 py-3 rounded-2xl border border-white/[0.08] focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all resize-none shadow-sm"
            placeholder="Share your thoughts or feedback on this creation..."
            rows={isInputFocused || newCommentContent ? 3 : 1}
            onFocus={() => setIsInputFocused(true)}
            {...register("content", { required: true })}
            disabled={submitting}
          />

          {(isInputFocused || newCommentContent) && (
            <div className="flex justify-end gap-2.5 mt-2.5">
              <button
                type="button"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                onClick={() => {
                  reset();
                  setIsInputFocused(false);
                }}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                disabled={!newCommentContent.trim() || submitting}
              >
                <FiSend className="text-xs" />
                {submitting ? "Posting..." : "Comment"}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comments List */}
      <div className="flex flex-col gap-5 mt-2">
        {loading && (
          <div className="flex justify-center py-6">
            <div className="spinner" />
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-xl bg-[#121215] border border-amber-500/20 text-center">
            <p className="text-sm text-amber-400 m-0">{error}</p>
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <p className="text-sm text-zinc-500 text-center py-4">
            No discussions yet. Be the first to share your thoughts!
          </p>
        )}

        {!loading &&
          !error &&
          comments.map((comment) => {
            const isOwner =
              currentUser?._id &&
              comment.owner?._id &&
              currentUser._id === comment.owner._id;

            return (
              <div key={comment._id} className="flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10 bg-zinc-900">
                  {comment.owner?.avatar ? (
                    <img
                      className="w-full h-full object-cover"
                      src={comment.owner.avatar}
                      alt={comment.owner?.fullname || "User"}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-400 text-xs font-bold">
                      <FiUser />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                  {editingCommentId === comment._id ? (
                    <div className="flex flex-col gap-2 bg-[#121215] p-3.5 rounded-2xl border border-white/10 shadow-sm">
                      <textarea
                        className="w-full bg-[#09090b] text-zinc-100 px-3 py-2 rounded-xl border border-white/10 text-sm outline-none resize-none"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="px-4 py-1 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950"
                          onClick={() => saveEdit(comment._id)}
                          disabled={!editContent.trim()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-zinc-200">
                          @{comment.owner?.username || "user"}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>

                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mt-0.5 mb-1">
                        {comment.content}
                      </p>

                      {isOwner && (
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                            onClick={() => startEdit(comment)}
                            title="Edit comment"
                          >
                            <FiEdit2 /> Edit
                          </button>
                          <button
                            type="button"
                            className="hover:text-rose-400 inline-flex items-center gap-1 cursor-pointer"
                            onClick={deleteHandler(comment._id)}
                            title="Delete comment"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
};

export default CommentsSection;




