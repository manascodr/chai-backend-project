import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllTweets } from "../api/tweet.api";
import { formatTimeAgo } from "../utils/formatViews";
import { FiMessageSquare, FiGlobe, FiUser, FiArrowLeft, FiEdit3 } from "react-icons/fi";

/**
 * TweetFeedPage Component
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
    <section className="page tweets">
      <div className="tweets__container">
        {/* Header */}
        <header className="page__header">
          <div>
            <h1 className="page__title">Community Feed</h1>
            <p className="page__subtitle">Discover real-time updates and discussions from creators across VividStream.</p>
          </div>

          <div className="tweets__headerActions">
            <Link className="btn btn-primary" to="/tweets">
              <FiEdit3 /> My Posts
            </Link>
          </div>
        </header>

        {/* Global Stream Feed */}
        <section className="tweets__feed" aria-label="Community feed">
          <div className="tweets__feedHeader">
            <h2 className="tweets__sectionTitle">Recent Updates ({tweets.length})</h2>
          </div>

          {loading && (
            <div className="tweets__loading">
              <div className="spinner" />
            </div>
          )}

          {!loading && error && (
            <div className="state state--error">
              <p className="state__title">Failed to load feed</p>
              <p className="state__text">{error}</p>
            </div>
          )}

          {!loading && !error && tweets.length === 0 && (
            <div className="state state--empty">
              <FiGlobe style={{ fontSize: "2.5rem", color: "var(--accent)", marginBottom: "0.5rem" }} />
              <p className="state__title">No posts in community feed yet</p>
              <p className="state__text">Be the first creator to share an update!</p>
            </div>
          )}

          {!loading && !error && (
            <ul className="tweets__list">
              {tweets.map((t) => (
                <li key={t._id} className="tweet-item">
                  <div className="tweet-item__meta">
                    <div className="tweet-item__owner">
                      <div className="tweet-item__avatarWrap">
                        {t?.owner?.avatar ? (
                          <img
                            className="tweet-item__avatar"
                            src={t.owner.avatar}
                            alt={t?.owner?.fullname || t?.owner?.username || "User"}
                            loading="lazy"
                          />
                        ) : (
                          <div className="tweet-item__avatar tweet-item__avatar--placeholder">
                            <FiUser />
                          </div>
                        )}
                      </div>

                      <div className="tweet-item__ownerText">
                        <span className="tweet-item__ownerName">
                          {t?.owner?.fullname || "Creator"}
                        </span>
                        {t?.owner?.username ? (
                          <Link
                            className="tweet-item__ownerLink"
                            to={`/c/${t.owner.username}`}
                          >
                            @{t.owner.username}
                          </Link>
                        ) : (
                          <span className="tweet-item__ownerLink">@user</span>
                        )}
                      </div>
                    </div>

                    <span className="tweet-item__date">
                      {t?.createdAt ? formatTimeAgo(t.createdAt) : ""}
                    </span>
                  </div>

                  <p className="tweet-item__content">{t.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
};

export default TweetFeedPage;

