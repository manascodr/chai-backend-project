import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserHistory } from "../api/user.api";
import VideoCard from "../components/video/VideoCard";

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
          <h1 className="page__title">Watch history</h1>
          <p className="page__subtitle">Videos you’ve watched recently.</p>
        </div>
      </header>

      <div className="page__content">
        {loading && (
          <div className="state">
            <p className="state__title">Loading</p>
            <p className="state__text">Fetching watch history…</p>
          </div>
        )}

        {!loading && error && (
          <div className="state state--error">
            <p className="state__title">Couldn’t load history</p>
            <p className="state__text">{error}</p>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="state state--empty">
            <p className="state__title">No watch history</p>
            <p className="state__text">Start watching videos to see them here.</p>
            <div className="state__actions">
              <Link to="/">Browse videos</Link>
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
