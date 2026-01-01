import { toast } from "react-toastify";
import { logout } from "../api/auth.api";
import { useAuthStore } from "../stores/auth.store";
import { useEffect, useState } from "react";
import { getAllVideos } from "../api/video.api";

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
  console.log(videos);

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
    <>
      <h1>Home (protected)</h1>
      <button onClick={handleLogout}>Logout</button>
      {loading && <p>Loading videos...</p>}
      {error && <p>Error loading videos: {error}</p>}
      {!loading && !error && (
        <div className="video-list">
          {videos.map((video) => (
            <div key={video._id} className="video-container">
              <video width="320" height="240" controls>
                <source src={video.videoFile} type="video/mp4" />
              </video>
              <h4>{video.title}</h4>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Home;
