import api from "./axios";

const getVideoComments = (videoId) => api.get(`/comments/${videoId}`);

const addComment = (videoId, content) =>
  api.post(`/comments/${videoId}`, { content });

const deleteComment = (commentId) => api.delete(`/comments/c/${commentId}`);

const editComment = (commentId, content) =>
  api.patch(`/comments/c/${commentId}`, { content });



export { getVideoComments, addComment, deleteComment, editComment };
