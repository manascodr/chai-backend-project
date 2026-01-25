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
      setError(err?.response?.data?.message || "Failed to load tweets");
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
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create tweet");
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
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update tweet");
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
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete tweet");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="tweets">
      <div className="tweets__container">
        <header className="tweets__header">
          <div className="tweets__heading">
            <h1 className="tweets__title">Tweets</h1>
            <p className="tweets__subtitle">Short updates from your account.</p>
          </div>

          <div className="tweets__headerActions">
            <Link className="tweets__link" to="/tweets/feed">
              Feed
            </Link>
          </div>
        </header>

        <section className="tweets__compose" aria-label="Create tweet">
          <h2 className="tweets__sectionTitle">Create tweet</h2>

          <form className="tweets__form" onSubmit={onCreate}>
            <label className="tweets__label" htmlFor="tweetContent">
              Content
            </label>
            <textarea
              id="tweetContent"
              className="tweets__textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              rows={3}
              disabled={posting}
            />

            <div className="tweets__actions">
              <button className="tweets__button" type="submit" disabled={posting}>
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </section>

        <section className="tweets__feed" aria-label="Your tweets">
          <div className="tweets__feedHeader">
            <h2 className="tweets__sectionTitle">Your tweets</h2>
          </div>

          {loading && <p className="tweets__state">Loading...</p>}
          {!loading && error && <p className="tweets__state">{error}</p>}

          {!loading && !error && (
            <ul className="tweets__list">
              {tweets.length === 0 ? (
                <li className="tweets__empty">No tweets yet.</li>
              ) : (
                tweets.map((t) => (
                  <li key={t._id} className="tweet-item">
                    <div className="tweet-item__meta">
                      <span className="tweet-item__date">
                        {t?.createdAt ? new Date(t.createdAt).toLocaleString() : ""}
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
                            className="tweet-item__button"
                            type="button"
                            onClick={cancelEdit}
                            disabled={savingId === t._id}
                          >
                            Cancel
                          </button>
                          <button
                            className="tweet-item__button tweet-item__button--primary"
                            type="button"
                            onClick={() => saveEdit(t._id)}
                            disabled={savingId === t._id}
                          >
                            {savingId === t._id ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="tweet-item__content">{t.content}</p>

                        <div className="tweet-item__actions">
                          <button
                            className="tweet-item__button"
                            type="button"
                            onClick={() => startEdit(t)}
                            disabled={Boolean(deletingId)}
                          >
                            Edit
                          </button>
                          <button
                            className="tweet-item__button"
                            type="button"
                            onClick={() => onDelete(t._id)}
                            disabled={deletingId === t._id}
                          >
                            {deletingId === t._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
};

export default TweetsPage;
