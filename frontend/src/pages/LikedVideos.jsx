import { useEffect, useState } from "react";
import { getLikedVideos } from "../api/like.api";
import VideoCard from "../components/video/VideoCard";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FiThumbsUp, FiFilm } from "react-icons/fi";

/**
 * LikedVideos Component
 * 
 * Displays all videos that the current user has liked:
 * 1. 8-card skeleton placeholder grid during fetch.
 * 2. Total count metric badge in page header.
 * 3. Responsive 16:9 video card grid.
 */
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
          <h1 className="page__title">Liked Videos</h1>
          <p className="page__subtitle">All the videos you’ve given a thumbs up to.</p>
        </div>

        {!loading && (
          <div className="page__actions">
            <span className="badge badge--pill">
              <FiThumbsUp /> {totalVideos} {totalVideos === 1 ? "video" : "videos"}
            </span>
          </div>
        )}
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

        {!loading && videos.length === 0 && (
          <div className="state state--empty">
            <FiThumbsUp style={{ fontSize: "2.5rem", color: "var(--accent)", marginBottom: "0.5rem" }} />
            <p className="state__title">No liked videos yet</p>
            <p className="state__text">Give thumbs up to videos you enjoy to save them in this list.</p>
            <div className="state__actions">
              <Link to="/" className="btn btn-primary">
                <FiFilm /> Discover Videos
              </Link>
            </div>
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

