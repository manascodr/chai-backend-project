import { useParams } from "react-router-dom";
import { getVideoById } from "../api/video.api";
import { useEffect, useState } from "react";

const VideoDetails = () => {
  const { videoId } = useParams();
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getVideoById(videoId)
      .then((res) => setVideo(res.data.data))
      .catch((err) => setError(err.message || "Failed to load video"))
      .finally(() => setLoading(false));
  }, [videoId]);
//   console.log(video);

  return (
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
          <div className="channel-info">
            <img src={video.owner.avatar} alt="" />
            <p>{video.owner.fullname}</p>
            <p>100M subscribers</p>
          </div>
          <p>{video.description}</p>
        </div>
      )}
    </div>
  );
};

export default VideoDetails;
