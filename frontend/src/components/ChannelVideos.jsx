import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getChannelVideos } from "../api/user.api";
import { useParams } from "react-router-dom";
import VideoCard from "./video/VideoCard";
import { FiFilm } from "react-icons/fi";

/**
 * ChannelVideos Component
 * 
 * Fetches and displays all public videos created by the specified channel creator.
 */
const ChannelVideos = () => {
  const { username } = useParams();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    getChannelVideos(username)
      .then((res) => {
        if (cancelled) return;
        setVideos(res?.data?.data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err?.response?.data?.message || "Failed to load channel videos";
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="video-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="video-card-skeleton">
            <div className="skeleton-thumb" />
            <div className="skeleton-details">
              <div className="skeleton-lines" style={{ width: "100%" }}>
                <div className="skeleton-line skeleton-line--title" />
                <div className="skeleton-line skeleton-line--meta" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="state state--error">
        <p className="state__title">Could not load videos</p>
        <p className="state__text">{error}</p>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="state state--empty">
        <FiFilm style={{ fontSize: "2.5rem", color: "var(--accent)", marginBottom: "0.5rem" }} />
        <p className="state__title">No videos yet</p>
        <p className="state__text">This creator hasn't published any videos yet.</p>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map((v) => (
        <VideoCard key={v._id} video={v} />
      ))}
    </div>
  );
};

export default ChannelVideos;

