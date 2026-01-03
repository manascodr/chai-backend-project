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
  console.log(comments);

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
      <form className="add-comment-form" onSubmit={handleSubmit(submitHandler)}>
        <textarea
          placeholder="Add a comment..."
          rows="3"
          {...register("content", { required: true })}
        ></textarea>
        <button type="submit">Submit</button>
      </form>
      <h3>Comments</h3>
      {!loading && error && <p>Error loading comments: {error}</p>}
      {!loading &&
        !error &&
        (comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="comment">
              {editingCommentId === comment._id ? (
                <>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <button onClick={() => saveEdit(comment._id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <p>{comment.content}</p>
                  <button onClick={() => startEdit(comment)}>Edit</button>
                  <button onClick={deleteHandler(comment._id)}>Delete</button>
                </>
              )}
            </div>
          ))
        ))}
    </div>
  );
};

export default CommentsSection;
