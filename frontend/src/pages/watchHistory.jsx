import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserHistory } from "../api/user.api";
import VideoCard from "../components/video/VideoCard";
import { FiClock, FiFilm } from "react-icons/fi";

/**
 * WatchHistory Component
 * 
 * Displays the user's chronological video watch history:
 * 1. 8-card skeleton placeholder grid during fetch.
 * 2. Responsive 16:9 video card grid.
 * 3. Friendly empty state with direct action button to browse videos.
 */
const WatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserHistory()
      .then((res) => setHistory(res?.data?.data || []))
      .catch(() => setError("Failed to load watch history"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page page--history watch-history">
      <header className="page__header">
        <div>
          <h1 className="page__title">Watch History</h1>
          <p className="page__subtitle">All the videos you have watched recently on VividStream.</p>
        </div>
      </header>

      <div className="page__content">
        {loading && (
          <div className="video-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="video-card-skeleton">
                <div className="skeleton-thumb" />
                <div className="skeleton-details">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-lines">
                    <div className="skeleton-line skeleton-line--title" />
                    <div className="skeleton-line skeleton-line--meta" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="state state--error">
            <p className="state__title">Couldn’t load watch history</p>
            <p className="state__text">{error}</p>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="state state--empty">
            <FiClock style={{ fontSize: "2.5rem", color: "var(--accent)", marginBottom: "0.5rem" }} />
            <p className="state__title">No watch history yet</p>
            <p className="state__text">Videos you watch will automatically be recorded here.</p>
            <div className="state__actions">
              <Link to="/" className="btn btn-primary">
                <FiFilm /> Browse Videos
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="video-grid">
            {history.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WatchHistory;

