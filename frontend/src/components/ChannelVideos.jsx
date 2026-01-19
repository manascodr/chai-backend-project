import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getChannelVideos } from "../api/user.api";
import { useParams } from "react-router-dom";
import VideoCard from "./video/VideoCard";

const ChannelVideos = () => {
  const [videos, setVideos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { username } = useParams();

  useEffect(() => {
    getChannelVideos(username)
      .then((res) => {
        setVideos(res.data.data);
      })
      .catch((err) => {
        toast.error("Failed to load channel videos", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);
  console.log(videos);

  if (loading) return <div>Loading videos...</div>;
  if (error) return <p>{error}</p>;
  if (!videos.length) return <p>No videos yet.</p>;

  return (
    <>
      <div className="video-grid">
        {videos.map((v) => (
          <VideoCard key={v._id} video={v} />
        ))}
      </div>
    </>
  );
};

export default ChannelVideos;
