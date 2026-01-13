import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { getAllVideos } from "../api/video.api";
import { logout } from "../api/auth.api";
import { useAuthStore } from "../stores/auth.store";
import VideoCard from "../components/video/VideoCard";

const Home = () => {
  const clearUser = useAuthStore((s) => s.clearUser);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    getAllVideos()
      .then((res) => setVideos(res.data.data.videos || []))
      .catch(() => setError("Failed to load videos"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      toast.success("Logged out");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredVideos = videos.filter((v) =>
    (v?.title || "").toLowerCase().includes(normalizedQuery)
  );

  return (
    <div className="home">
      {/* Top Navigation */}
      <header className="home__nav">
        <Link to="/" className="home__brand">
          <span>▶</span> ChaiTube
        </Link>

        <div className="home__search">
          <input
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button className="home__logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Main Layout */}
      <div className="home__content">
        {/* Sidebar */}
        <aside className="home__sidebar">
          <Link to="/" className="home__link home__link--active">
            Home
          </Link>
          <Link to="/watch-history" className="home__link">
            Watch History
          </Link>
        </aside>

        {/* Main Video Feed */}
        <main className="home__feed">
          {loading && <p>Loading videos...</p>}
          {error && <p>{error}</p>}

          {!loading && !error && (
            <div className="video-grid">
              {filteredVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
