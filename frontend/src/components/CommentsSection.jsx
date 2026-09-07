import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
        <FiMessageSquare className="text-zinc-300 text-base" />
        <h3 className="text-base font-semibold text-zinc-100 tracking-tight m-0">
          {comments.length} {comments.length === 1 ? "Discussion" : "Discussions"}
        </h3>
      </div>

      {/* Add New Comment Box or Sign-in Prompt for Guest */}
      {currentUser ? (
        <form className="flex items-start gap-3.5" onSubmit={handleSubmit(submitHandler)}>
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/[0.1] bg-[#181a20]">
            {currentUser?.avatar ? (
              <img className="w-full h-full object-cover" src={currentUser.avatar} alt="You" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-medium">
                <FiUser />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <textarea
              className="w-full bg-[#111317] text-zinc-100 placeholder-zinc-500 px-4 py-2.5 rounded-xl border border-white/[0.08] focus:border-white/30 focus:ring-1 focus:ring-white/10 text-sm outline-none transition-all resize-none shadow-xs"
              placeholder="Share your perspective on this creation..."
              rows={isInputFocused || newCommentContent ? 3 : 1}
              onFocus={() => setIsInputFocused(true)}
              {...register("content", { required: true })}
              disabled={submitting}
            />

            {(isInputFocused || newCommentContent) && (
              <div className="flex justify-end gap-2 mt-2.5">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors cursor-pointer tactile-btn"
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
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 shadow-xs transition-all disabled:opacity-50 cursor-pointer tactile-btn"
                  disabled={!newCommentContent.trim() || submitting}
                >
                  <FiSend className="text-xs" />
                  <span>{submitting ? "Posting..." : "Comment"}</span>
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#111317] border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 text-xs">
              <FiUser />
            </div>
            <p className="text-xs text-zinc-300 font-medium m-0">
              Want to join the conversation? Sign in to leave a comment.
            </p>
          </div>
          <Link
            to="/login"
            state={{ from: `/watch/${videoId}` }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-sm transition-all no-underline shrink-0 tactile-btn"
          >
            <span>Sign In</span>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="flex flex-col gap-5 mt-1">
        {loading && (
          <div className="flex justify-center py-6">
            <div className="spinner" />
          </div>
        )}

        {!loading && error && (
          <div className="p-3.5 rounded-xl bg-[#111317] border border-white/[0.08] text-center">
            <p className="text-xs text-zinc-300 m-0">{error}</p>
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <p className="text-xs text-zinc-500 text-center py-6">
            No discussions yet. Be the first to start a conversation.
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
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/[0.1] bg-[#181a20]">
                  {comment.owner?.avatar ? (
                    <img
                      className="w-full h-full object-cover"
                      src={comment.owner.avatar}
                      alt={comment.owner?.fullname || "User"}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-medium">
                      <FiUser />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                  {editingCommentId === comment._id ? (
                    <div className="flex flex-col gap-2 bg-[#111317] p-3 rounded-xl border border-white/[0.08] shadow-xs">
                      <textarea
                        className="w-full bg-[#090a0d] text-zinc-100 px-3 py-2 rounded-lg border border-white/[0.08] text-sm outline-none resize-none"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 text-xs font-medium bg-white text-zinc-950 rounded-lg tactile-btn"
                          onClick={() => saveEdit(comment._id)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-200">
                          {comment.owner?.fullname || comment.owner?.username || "Creator"}
                        </span>
                        <span className="text-[11px] text-zinc-500 tabular-nums">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 mt-1 leading-relaxed whitespace-pre-wrap font-normal m-0">
                        {comment.content}
                      </p>
                      {isOwner && (
                        <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                            onClick={() => startEdit(comment)}
                          >
                            <FiEdit2 className="text-[10px]" /> Edit
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            onClick={deleteHandler(comment._id)}
                          >
                            <FiTrash2 className="text-[10px]" /> Delete
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
