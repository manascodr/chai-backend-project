import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getChannelVideos } from "../api/user.api";
import { useParams } from "react-router-dom";
import VideoCard from "./video/VideoCard";

const ChannelVideos = () => {
  const { username } = useParams();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError("");
    });

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
      // this return runs when the component unmounts(means we leave the page or the dependencies change)
      cancelled = true;
    };
  }, [username]);

  if (loading) return <p>Loading videos...</p>;
  if (error) return <p>{error}</p>;
  if (!videos.length) return <p>No videos yet.</p>;

  return (
    <div className="video-grid">
      {videos.map((v) => (
        <VideoCard key={v._id} video={v} />
      ))}
    </div>
  );
};

export default ChannelVideos;
