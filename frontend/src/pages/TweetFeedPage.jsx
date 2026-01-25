import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllTweets } from "../api/tweet.api";

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
      const message = err?.response?.data?.message || "Failed to load tweet feed";
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
    <section className="tweets">
      <div className="tweets__container">
        <header className="tweets__header">
          <div className="tweets__heading">
            <h1 className="tweets__title">Tweet Feed</h1>
            <p className="tweets__subtitle">Recent posts from everyone.</p>
          </div>

          <div className="tweets__headerActions">
            <Link className="tweets__link" to="/tweets">
              My tweets
            </Link>
          </div>
        </header>

        <section className="tweets__feed" aria-label="Tweet feed">
          <div className="tweets__feedHeader">
            <h2 className="tweets__sectionTitle">Latest</h2>
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
                      <div className="tweet-item__owner">
                        {t?.owner?.avatar ? (
                          <img
                            className="tweet-item__avatar"
                            src={t.owner.avatar}
                            alt={t?.owner?.fullname || t?.owner?.username || "User"}
                            loading="lazy"
                          />
                        ) : (
                          <div className="tweet-item__avatar tweet-item__avatar--placeholder" />
                        )}

                        <div className="tweet-item__ownerText">
                          <div className="tweet-item__ownerName">
                            {t?.owner?.fullname || "User"}
                          </div>
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
                        {t?.createdAt ? new Date(t.createdAt).toLocaleString() : ""}
                      </span>
                    </div>

                    <p className="tweet-item__content">{t.content}</p>
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

export default TweetFeedPage;
