import { useEffect, useState } from "react";
import {
  getVideoComments,
  addComment,
  deleteComment,
  editComment,
} from "../api/comment.api";
import { useForm } from "react-hook-form";

const CommentsSection = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const { register, handleSubmit, reset } = useForm();
  // Submit new comment
  const submitHandler = async ({ content }) => {
    try {
      await addComment(videoId, content);
      const res = await getVideoComments(videoId);
      setComments(res.data.data);
    } catch (err) {
      setError(err.message || "Failed to add comment");
    }
    reset();
  };

  // Fetch comments on component mount
  useEffect(() => {
    getVideoComments(videoId)
      .then((res) => setComments(res.data.data)  )
      .catch((err) => setError(err.message || "Failed to load comments"))
      .finally(() => setLoading(false));
  }, [videoId]);
  // console.log(comments);

  // Delete comment handler
  const deleteHandler = (commentId) => async () => {
    try {
      await deleteComment(commentId);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
    } catch (error) {
      setError(error.message || "Failed to delete comment");
    }
  };
    // Edit comment handlers
  const startEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
  };
  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };
  const saveEdit = async (commentId) => {
    try {
      const res = await editComment(commentId, editContent);

      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.data.data : c))
      );

      setEditingCommentId(null);
      setEditContent("");
    } catch (err) {
      setError(err.message || "Failed to edit comment");
    }
  };

  return (
    <div className="comments-section">
      {/* Comments Header */}
      <div className="comments-header">
        <h3>{comments.length} Comments</h3>
      </div>

      {/* Add Comment Form */}
      <form className="add-comment-form" onSubmit={handleSubmit(submitHandler)}>
        <div className="comment-input-wrapper">
          <textarea
            className="comment-input"
            placeholder="Add a comment..."
            rows="1"
            {...register("content", { required: true })}
          ></textarea>
          <div className="comment-actions">
            <button type="submit" className="btn-comment">Comment</button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {loading && <div className="comments-loading"><div className="spinner"></div></div>}
        {!loading && error && <p className="comments-error">Error loading comments: {error}</p>}
        {!loading && !error && comments.length === 0 && (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        )}
        {!loading &&
          !error &&
          comments.map((comment) => (
            <div key={comment._id} className="comment">
              <div className="comment-avatar">
                <img src={comment.owner?.avatar || "/default-avatar.png"} alt="" />
              </div>
              <div className="comment-body">
                {editingCommentId === comment._id ? (
                  <div className="comment-edit-form">
                    <textarea
                      className="comment-input"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="comment-actions">
                      <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                      <button className="btn-comment" onClick={() => saveEdit(comment._id)}>Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="comment-header">
                      <span className="comment-author">@{comment.owner?.username || "user"}</span>
                      <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                    <div className="comment-footer">
                      <button className="action-btn edit-btn" onClick={() => startEdit(comment)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={deleteHandler(comment._id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CommentsSection;
