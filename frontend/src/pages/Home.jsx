import { useEffect, useState } from "react";
import { getAllVideos } from "../api/video.api";
import VideoCard from "../components/video/VideoCard";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllVideos()
      .then((res) => setVideos(res.data.data.videos || []))
      .catch(() => setError("Failed to load videos"))
      .finally(() => setLoading(false));
  }, []);

  const filteredVideos = videos;

  return (
    <>
      {/* Main Video Feed */}

      {loading && <p>Loading videos...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="video-grid">
          {filteredVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </>
  );
};

export default Home;
