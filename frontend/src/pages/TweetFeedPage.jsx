import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllTweets } from "../api/tweet.api";
import { formatTimeAgo } from "../utils/formatViews";
import { FiGlobe, FiUser, FiEdit3 } from "react-icons/fi";

/**
 * TweetFeedPage Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Global public stream for community posts across all channels:
 * 1. Shows creator avatar, name, and channel handle link.
 * 2. Displays humanized relative timestamps (e.g. "12m ago").
 */
const TweetFeedPage = () => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getAllTweets();
      setTweets(res?.data?.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load community feed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">Community Stream</h1>
          <p className="text-sm text-zinc-400 mt-1 m-0">Discover real-time updates and discussions from creators across VividStream.</p>
        </div>

        <Link
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all no-underline self-start sm:self-auto"
          to="/tweets"
        >
          <FiEdit3 /> My Posts
        </Link>
      </header>

      {/* Global Stream Feed */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white tracking-tight m-0">Recent Creator Broadcasts</h2>
          <span className="text-sm font-semibold text-zinc-500">({tweets.length})</span>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        )}

        {!loading && error && (
          <div className="p-6 rounded-3xl bg-[#121215] border border-amber-500/20 text-center">
            <p className="text-base font-bold text-amber-400 mb-1">Failed to load feed</p>
            <p className="text-sm text-zinc-400 m-0">{error}</p>
          </div>
        )}

        {!loading && !error && tweets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-[#121215] rounded-3xl border border-white/10 text-center px-4">
            <FiGlobe className="text-4xl text-amber-400/60 mb-3 opacity-80" />
            <p className="text-base font-bold text-zinc-200 mb-1">No posts in community feed yet</p>
            <p className="text-xs text-zinc-500 m-0">Be the first creator to share an update!</p>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-4">
            {tweets.map((t) => (
              <article key={t._id} className="p-5 rounded-3xl bg-[#121215] border border-white/[0.08] hover:border-amber-500/20 transition-all flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-zinc-900 border border-white/10">
                      {t?.owner?.avatar ? (
                        <img
                          className="w-full h-full object-cover"
                          src={t.owner.avatar}
                          alt={t?.owner?.fullname || t?.owner?.username || "User"}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-400 text-xs font-bold">
                          <FiUser />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white leading-none">
                        {t?.owner?.fullname || "Creator"}
                      </span>
                      {t?.owner?.username ? (
                        <Link
                          className="text-xs text-amber-400 hover:text-amber-300 font-medium mt-0.5 no-underline transition-colors"
                          to={`/c/${t.owner.username}`}
                        >
                          @{t.owner.username}
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-500 mt-0.5">@user</span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-zinc-500">
                    {t?.createdAt ? formatTimeAgo(t.createdAt) : ""}
                  </span>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap m-0">{t.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TweetFeedPage;




