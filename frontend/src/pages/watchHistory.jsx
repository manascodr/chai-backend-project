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

  if (loading) {
    return <div className="watch-history loading">Loading history…</div>;
  }

  if (error) {
    return <div className="watch-history error">{error}</div>;
  }

  if (!history.length) {
    return (
      <div className="watch-history empty">
        <h2>No watch history yet</h2>
        <Link to="/">Browse videos</Link>
      </div>
    );
  }

  return (
    <>
      <h1>Watch History</h1>

      <div className="video-grid">
        {history.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </>
  );
};

export default WatchHistory;
