import { useParams } from "react-router-dom";
import { getVideoById } from "../api/video.api";
import { useEffect, useState } from "react";
import { likeVideo } from "../api/like.api";
import CommentsSection from "./../components/CommentsSection";

const VideoDetails = () => {
  const { videoId } = useParams();
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    getVideoById(videoId)
      .then((res) => setVideo(res.data.data))
      .catch((err) => setError(err.message || "Failed to load video"))
      .finally(() => setLoading(false));
  }, [videoId]);
  //   console.log(video);

  const likeHandler = async (videoId) => {
    try {
      const res = await likeVideo(videoId);
      setLiked(res.data.data.liked);
      console.log(res);
    } catch (err) {
      console.error("Error liking the video:", err);
    }
  };

  return (
    <>
      <div className="video-container">
        {loading && <p>Loading video...</p>}
        {error && <p>Error loading video: {error}</p>}
        {!loading && !error && video && (
          <div>
            <h2>{video.title}</h2>
            <video width="600" controls>
              <source src={video.videoFile} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p>
              {video.views} views | Uploaded on{" "}
              {new Date(video.createdAt).toLocaleDateString()}
            </p>
            <h4>{video.title}</h4>
            <button onClick={() => likeHandler(videoId)}>
              {liked ? "Unlike" : "Like"}
            </button>
            <div className="channel-info">
              <img src={video.owner.avatar} alt="" />
              <p>{video.owner.fullname}</p>
              <p>100M subscribers</p>
            </div>
            <p>{video.description}</p>
          </div>
        )}
      </div>
      <CommentsSection videoId={videoId} />
    </>
  );
};

export default VideoDetails;
