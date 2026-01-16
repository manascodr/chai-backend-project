import { useEffect, useState } from "react";
import { getLikedVideos } from "../api/like.api";
import VideoCard from "../components/video/VideoCard";
import { toast } from "react-toastify";

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalVideos, setTotalVideos] = useState(0);

  useEffect(() => {
    getLikedVideos()
      .then((res) => {
        setVideos(res?.data?.data?.videos || []);
        setTotalVideos(res?.data?.data?.total || 0);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch liked videos");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading liked videos…</p>;

  return (
    <div>
      <h1>
        Liked Videos <span className="muted">({totalVideos})</span>
      </h1>

      {!videos.length ? (
        <p>No liked videos yet.</p>
      ) : (
        <div className="video-grid">
          {videos.map((v) => (
            <VideoCard key={v._id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
