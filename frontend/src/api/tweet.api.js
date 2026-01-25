import api from "./axios";

// POST /api/v1/tweets
// Body: { content }
const createTweet = (content) => api.post("/tweets", { content });

// GET /api/v1/tweets/user/:userId
const getUserTweets = (userId) => api.get(`/tweets/user/${userId}`);

// GET /api/v1/tweets
const getAllTweets = () => api.get("/tweets");

// PATCH /api/v1/tweets/:tweetId
// Body: { content }
const updateTweet = (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content });

// DELETE /api/v1/tweets/:tweetId
const deleteTweet = (tweetId) => api.delete(`/tweets/${tweetId}`);

export { createTweet, getUserTweets, getAllTweets, updateTweet, deleteTweet };
