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
 * TweetsPage Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Community microblogging portal for creator updates:
 * 1. Rich compose box with obsidian glass and gold highlights.
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">Creator Community</h1>
          <p className="text-sm text-zinc-400 mt-1 m-0">Share thoughts, updates, and sneak peeks with your audience.</p>
        </div>

        <Link
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#141418] hover:bg-[#1c1c22] text-zinc-200 border border-white/10 hover:border-amber-500/30 text-sm font-semibold transition-all no-underline shadow-sm self-start sm:self-auto"
          to="/tweets/feed"
        >
          <FiGlobe className="text-amber-400" /> Explore Global Feed
        </Link>
      </header>

      {/* Compose Card */}
      <section className="bg-[#121215] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex gap-4 backdrop-blur-xl">
        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-zinc-900 border border-white/10">
          {user?.avatar ? (
            <img className="w-full h-full object-cover" src={user.avatar} alt="You" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-400 font-bold">
              <FiUser />
            </div>
          )}
        </div>

        <form className="flex-1 flex flex-col gap-3" onSubmit={onCreate}>
          <textarea
            id="tweetContent"
            className="w-full bg-[#09090b] text-white px-4 py-3 rounded-2xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all placeholder-zinc-500 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share an update with your subscribers..."
            rows={3}
            disabled={posting}
          />

          <div className="flex justify-end">
            <button
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
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
      </section>

      {/* User's Tweets Feed */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white tracking-tight m-0">Your Published Posts</h2>
          <span className="text-sm font-semibold text-zinc-500">({tweets.length})</span>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        )}

        {!loading && error && (
          <div className="p-6 rounded-3xl bg-[#121215] border border-amber-500/20 text-center">
            <p className="text-base font-bold text-amber-400 mb-1">Failed to load posts</p>
            <p className="text-sm text-zinc-400 m-0">{error}</p>
          </div>
        )}

        {!loading && !error && tweets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-[#121215] rounded-3xl border border-white/10 text-center px-4">
            <FiMessageSquare className="text-4xl text-amber-400/60 mb-3 opacity-80" />
            <p className="text-base font-bold text-zinc-200 mb-1">No community posts yet</p>
            <p className="text-xs text-zinc-500 m-0">Write your first update above to interact with your channel viewers.</p>
          </div>
        )}

        {!loading && !error && tweets.length > 0 && (
          <div className="flex flex-col gap-4">
            {tweets.map((t) => (
              <article key={t._id} className="p-5 rounded-3xl bg-[#121215] border border-white/[0.08] hover:border-amber-500/20 transition-all flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-zinc-900 border border-white/10">
                      {user?.avatar ? (
                        <img className="w-full h-full object-cover" src={user.avatar} alt="You" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-400 text-xs font-bold">
                          <FiUser />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white leading-none">{user?.fullname || "You"}</span>
                      <span className="text-xs text-amber-400 font-medium mt-0.5">@{user?.username || "you"}</span>
                    </div>
                  </div>

                  <span className="text-xs text-zinc-500">
                    {t?.createdAt ? formatTimeAgo(t.createdAt) : ""}
                  </span>
                </div>

                {editingId === t._id ? (
                  <div className="flex flex-col gap-2.5">
                    <textarea
                      className="w-full bg-[#09090b] text-white px-3.5 py-2.5 rounded-xl border border-white/10 text-sm outline-none resize-none"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={3}
                      disabled={savingId === t._id}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-400 hover:text-white"
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingId === t._id}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950"
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
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap m-0">{t.content}</p>

                    <div className="flex items-center gap-3 pt-2 border-t border-white/[0.08]">
                      <button
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                        type="button"
                        onClick={() => startEdit(t)}
                        disabled={Boolean(deletingId)}
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                        type="button"
                        onClick={() => onDelete(t._id)}
                        disabled={deletingId === t._id}
                      >
                        <FiTrash2 /> {deletingId === t._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TweetsPage;




