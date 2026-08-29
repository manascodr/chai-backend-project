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
import { FiMessageSquare, FiEdit2, FiTrash2, FiUser, FiSend, FiX } from "react-icons/fi";

/**
 * CommentsSection Component
 * 
 * Provides YouTube-style dynamic video comments:
 * 1. User avatar input field with auto-revealing 'Cancel' and 'Comment' action buttons.
 * 2. Instant optimistic updates on adding, editing, and deleting comments.
 * 3. Humanized relative timestamps (e.g. "3 hours ago", "2 days ago").
 * 4. Inline comment editing form.
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
      toast.success("Comment added!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch comments on component mount or video change
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
    <section className="comments-section" aria-label="Comments">
      {/* Comments Header */}
      <div className="comments-header">
        <div className="comments-header__titleWrap">
          <FiMessageSquare className="comments-header__icon" />
          <h3 className="comments-header__title">
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </h3>
        </div>
      </div>

      {/* Add New Comment Box */}
      <form className="add-comment-form" onSubmit={handleSubmit(submitHandler)}>
        <div className="comment-avatar">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="You" />
          ) : (
            <div className="comment-avatar--placeholder">
              <FiUser />
            </div>
          )}
        </div>

        <div className="comment-input-wrapper">
          <textarea
            className="comment-input"
            placeholder="Add a comment..."
            rows={isInputFocused || newCommentContent ? 3 : 1}
            onFocus={() => setIsInputFocused(true)}
            {...register("content", { required: true })}
            disabled={submitting}
          />

          {(isInputFocused || newCommentContent) && (
            <div className="comment-actions">
              <button
                type="button"
                className="btn btn-ghost"
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
                className="btn btn-primary"
                disabled={!newCommentContent.trim() || submitting}
              >
                {submitting ? "Posting..." : "Comment"}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {loading && (
          <div className="comments-loading">
            <div className="spinner" />
          </div>
        )}

        {!loading && error && (
          <div className="state state--error">
            <p className="state__title">Couldn't load comments</p>
            <p className="state__text">{error}</p>
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
        )}

        {!loading &&
          !error &&
          comments.map((comment) => {
            const isOwner =
              currentUser?._id &&
              comment.owner?._id &&
              currentUser._id === comment.owner._id;

            return (
              <div key={comment._id} className="comment">
                <div className="comment-avatar">
                  {comment.owner?.avatar ? (
                    <img
                      src={comment.owner.avatar}
                      alt={comment.owner?.fullname || "User"}
                    />
                  ) : (
                    <div className="comment-avatar--placeholder">
                      <FiUser />
                    </div>
                  )}
                </div>

                <div className="comment-body">
                  {editingCommentId === comment._id ? (
                    <div className="comment-edit-form">
                      <textarea
                        className="comment-input comment-input--editing"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                      />
                      <div className="comment-actions">
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => saveEdit(comment._id)}
                          disabled={!editContent.trim()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="comment-header">
                        <span className="comment-author">
                          @{comment.owner?.username || "user"}
                        </span>
                        <span className="comment-time">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>

                      <p className="comment-content">{comment.content}</p>

                      {isOwner && (
                        <div className="comment-footer">
                          <button
                            type="button"
                            className="comment-action-btn"
                            onClick={() => startEdit(comment)}
                            title="Edit comment"
                          >
                            <FiEdit2 /> Edit
                          </button>
                          <button
                            type="button"
                            className="comment-action-btn comment-action-btn--delete"
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

