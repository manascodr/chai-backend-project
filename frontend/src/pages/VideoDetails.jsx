import { useParams } from "react-router-dom";
import { getVideoById } from "../api/video.api";
import { useEffect, useState } from "react";
import { likeVideo } from "../api/like.api";
import CommentsSection from "./../components/CommentsSection";
import { toggleSubscription } from "../api/subscriptions.auth";

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
            <button disabled={!video} onClick={() => handleSubscribe()}>
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
            <p>{`${likesCount} likes`}</p>
            <button onClick={() => likeHandler()}>
              {liked ? "Unlike" : "Like"}
            </button>
            <div className="channel-info">
              <img src={video.owner.avatar} alt="" />
              <p>{video.owner.fullname}</p>
              <p>{`${subscriberCount} subscribers`} </p>
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
