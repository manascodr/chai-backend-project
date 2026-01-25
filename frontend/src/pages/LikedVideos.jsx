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

  return (
    <section className="page page--liked liked-videos">
      <header className="page__header">
        <div>
          <h1 className="page__title">Liked videos</h1>
          <p className="page__subtitle">Your liked videos in one place.</p>
        </div>

        {!loading && (
          <div className="page__actions">
            <span className="muted">{totalVideos} total</span>
          </div>
        )}
      </header>

      <div className="page__content">
        {loading && (
          <div className="state">
            <p className="state__title">Loading</p>
            <p className="state__text">Fetching liked videos…</p>
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="state state--empty">
            <p className="state__title">No liked videos</p>
            <p className="state__text">Like a video and it will appear here.</p>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="video-grid">
            {videos.map((v) => (
              <VideoCard key={v._id} video={v} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LikedVideos;
