import { useParams } from "react-router-dom";
import { getVideoById } from "../api/video.api";
import { useEffect, useState } from "react";
import { likeVideo } from "../api/like.api";
import CommentsSection from "./../components/CommentsSection";
import { toggleSubscription } from "../api/subscriptions.auth";
import VideoPlayer from "../components/video/VideoPlayer";

const VideoDetails = () => {
  const { videoId } = useParams();
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const [subscriberCount, setSubscriberCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);

  // Fetch video details on component mount
  useEffect(() => {
    getVideoById(videoId)
      .then((res) => {
        const { video, isLiked, isSubscribed, subscriberCount, likesCount } =
          res.data.data;

        setVideo(video);
        setLiked(isLiked);
        setSubscribed(isSubscribed);
        setSubscriberCount(subscriberCount);
        setLikesCount(likesCount);
      })
      .catch((err) => setError(err.message || "Failed to load video"))
      .finally(() => setLoading(false));
  }, [videoId]);
  // console.log(video);

  // Like video handler
  const likeHandler = async () => {
    const res = await likeVideo(videoId);
    const liked = res.data.data.liked;

    setLiked(liked);
    setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
  };

  // Subscribe handler
  const handleSubscribe = async () => {
    const res = await toggleSubscription(video?.owner._id);
    const subscribed = res.data.data.subscribed;

    setSubscribed(subscribed);
    setSubscriberCount((prev) => (subscribed ? prev + 1 : prev - 1));
  };

  return (
    <>
      <div className="video-details">
        {loading && <p>Loading video...</p>}
        {error && <p>Error loading video: {error}</p>}

        {!loading && !error && video && (
          <>
            <div className="video-player">
              <VideoPlayer videoFile={video.videoFile} />
            </div>

            <div className="video-info">
              <h2 className="video-title">{video.title}</h2>

              <div className="video-actions">
                <button disabled={!video} onClick={handleSubscribe}>
                  {subscribed ? "Subscribed" : "Subscribe"}
                </button>

                <button onClick={likeHandler}>
                  {liked ? "Unlike" : "Like"} ({likesCount})
                </button>
              </div>
            </div>

            <div className="video-meta">
              {video.views} views ·{" "}
              {new Date(video.createdAt).toLocaleDateString()}
            </div>

            <div className="channel-info">
              <img src={video.owner.avatar} alt="" />
              <div>
                <p>{video.owner.fullname}</p>
                <p>{subscriberCount} subscribers</p>
              </div>
            </div>

            <p className="video-description">{video.description}</p>
          </>
        )}
      </div>

      <CommentsSection videoId={videoId} />
    </>
  );
};

export default VideoDetails;
