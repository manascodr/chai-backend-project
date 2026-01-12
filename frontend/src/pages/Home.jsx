import { toast } from "react-toastify";
import { logout } from "../api/auth.api";
import { useAuthStore } from "../stores/auth.store";
import { useEffect, useState } from "react";
import { getAllVideos } from "../api/video.api";
import VideoCard from "../components/video/VideoCard";
import { Link } from "react-router-dom";
import HomeSidebar from "../components/layout/HomeSidebar";

const Home = () => {
  // Access the clearUser action from the auth store
  const clearUser = useAuthStore((s) => s.clearUser);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllVideos()
      .then((res) => setVideos(res.data.data.videos))
      .catch((err) => setError(err.message || "Failed to load videos"))
      .finally(() => setLoading(false));
  }, []);
  // console.log(videos);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout(); // Call the logout API
      clearUser(); // Clear user from the store
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Error logging out", err?.message);
    }
  };

  return (
    <div className="home">
      <header className="home__topbar">
        <Link to="/" className="home__brand" aria-label="Home">
          <span className="home__logo" aria-hidden="true">
            ▶
          </span>
          <span className="home__brand-text">ChaiTube</span>
        </Link>

        <div className="home__actions">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="home__layout">
        <HomeSidebar />

        <main className="home__main">
          <div className="home__meta">
            {!loading && !error && (
              <p>Showing {videos.length}</p>
            )}
          </div>

          {loading && (
            <p aria-busy="true" aria-live="polite">Loading videos…</p>
          )}

          {error && <p>Error loading videos: {error}</p>}

          {!loading && !error && (
            <div className="video-list">
              {videos.map((video) => (
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
