import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../stores/auth.store";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../api/tweet.api";
import { formatTimeAgo } from "../utils/formatViews";
import { FiMessageSquare, FiSend, FiEdit2, FiTrash2, FiGlobe, FiUser } from "react-icons/fi";

/**
 * TweetsPage Component
 * 
 * Community microblogging portal for creator updates:
 * 1. Rich compose box with character feedback.
 * 2. Instant feed updates on create, edit, and delete.
 * 3. Relative timestamps (e.g. "5m ago", "2d ago").
 */
const TweetsPage = () => {
  const user = useAuthStore((s) => s.user);

  const userId = user?._id;
  const canLoad = useMemo(() => Boolean(userId), [userId]);

  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    if (!canLoad) return;

    setLoading(true);
    setError("");

    try {
      const res = await getUserTweets(userId);
      setTweets(res?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load community posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (posting) return;

    const trimmed = content.trim();
    if (!trimmed) return;

    setPosting(true);
    try {
      const res = await createTweet(trimmed);
      const created = res?.data?.data;
      if (created) setTweets((prev) => [created, ...prev]);
      setContent("");
      toast.success("Post published to community!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const startEdit = (tweet) => {
    setEditingId(tweet._id);
    setEditValue(tweet.content || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (tweetId) => {
    if (savingId) return;

    const trimmed = editValue.trim();
    if (!trimmed) return;

    setSavingId(tweetId);
    try {
      const res = await updateTweet(tweetId, trimmed);
      const updated = res?.data?.data;

      if (updated) {
        setTweets((prev) => prev.map((t) => (t._id === tweetId ? updated : t)));
      }

      setEditingId(null);
      setEditValue("");
      toast.success("Post updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update post");
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (tweetId) => {
    if (deletingId) return;

    setDeletingId(tweetId);
    try {
      await deleteTweet(tweetId);
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
      toast.info("Post deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="page tweets">
      <div className="tweets__container">
        {/* Header */}
        <header className="page__header">
          <div>
            <h1 className="page__title">Community Posts</h1>
            <p className="page__subtitle">Share thoughts, updates, and sneak peeks with your audience.</p>
          </div>

          <div className="tweets__headerActions">
            <Link className="btn btn-secondary" to="/tweets/feed">
              <FiGlobe /> Explore Community Feed
            </Link>
          </div>
        </header>

        {/* Compose Card */}
        <section className="tweets__compose" aria-label="Create tweet">
          <div className="tweets__composeTop">
            <div className="tweet-item__avatarWrap">
              {user?.avatar ? (
                <img className="tweet-item__avatar" src={user.avatar} alt="You" />
              ) : (
                <div className="tweet-item__avatar tweet-item__avatar--placeholder">
                  <FiUser />
                </div>
              )}
            </div>

            <form className="tweets__form" onSubmit={onCreate}>
              <textarea
                id="tweetContent"
                className="tweets__textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share an update with your subscribers..."
                rows={3}
                disabled={posting}
              />

              <div className="tweets__actions">
                <button
                  className="btn btn-primary tweets__postBtn"
                  type="submit"
                  disabled={posting || !content.trim()}
                >
                  {posting ? (
                    "Posting..."
                  ) : (
                    <>
                      <FiSend /> Post Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* User's Tweets Feed */}
        <section className="tweets__feed" aria-label="Your tweets">
          <div className="tweets__feedHeader">
            <h2 className="tweets__sectionTitle">Your Published Posts ({tweets.length})</h2>
          </div>

          {loading && (
            <div className="tweets__loading">
              <div className="spinner" />
            </div>
          )}

          {!loading && error && (
            <div className="state state--error">
              <p className="state__title">Failed to load posts</p>
              <p className="state__text">{error}</p>
            </div>
          )}

          {!loading && !error && tweets.length === 0 && (
            <div className="state state--empty">
              <FiMessageSquare style={{ fontSize: "2.5rem", color: "var(--accent)", marginBottom: "0.5rem" }} />
              <p className="state__title">No community posts yet</p>
              <p className="state__text">Write your first update above to interact with your channel viewers.</p>
            </div>
          )}

          {!loading && !error && tweets.length > 0 && (
            <ul className="tweets__list">
              {tweets.map((t) => (
                <li key={t._id} className="tweet-item">
                  <div className="tweet-item__meta">
                    <div className="tweet-item__owner">
                      <div className="tweet-item__avatarWrap">
                        {user?.avatar ? (
                          <img className="tweet-item__avatar" src={user.avatar} alt="You" />
                        ) : (
                          <div className="tweet-item__avatar tweet-item__avatar--placeholder">
                            <FiUser />
                          </div>
                        )}
                      </div>

                      <div className="tweet-item__ownerText">
                        <span className="tweet-item__ownerName">{user?.fullname || "You"}</span>
                        <span className="tweet-item__ownerLink">@{user?.username || "you"}</span>
                      </div>
                    </div>

                    <span className="tweet-item__date">
                      {t?.createdAt ? formatTimeAgo(t.createdAt) : ""}
                    </span>
                  </div>

                  {editingId === t._id ? (
                    <div className="tweet-item__edit">
                      <textarea
                        className="tweet-item__textarea"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={3}
                        disabled={savingId === t._id}
                      />
                      <div className="tweet-item__actions">
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={cancelEdit}
                          disabled={savingId === t._id}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => saveEdit(t._id)}
                          disabled={savingId === t._id}
                        >
                          {savingId === t._id ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="tweet-item__content">{t.content}</p>

                      <div className="tweet-item__actions">
                        <button
                          className="btn btn-ghost tweet-action-btn"
                          type="button"
                          onClick={() => startEdit(t)}
                          disabled={Boolean(deletingId)}
                        >
                          <FiEdit2 /> Edit
                        </button>
                        <button
                          className="btn btn-ghost tweet-action-btn tweet-action-btn--delete"
                          type="button"
                          onClick={() => onDelete(t._id)}
                          disabled={deletingId === t._id}
                        >
                          <FiTrash2 /> {deletingId === t._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
};

export default TweetsPage;

