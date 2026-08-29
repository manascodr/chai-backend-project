import { useNavigate, useParams, Link } from "react-router-dom";
import { getVideoById } from "../api/video.api";
import { useEffect, useState } from "react";
import { likeVideo } from "../api/like.api";
import CommentsSection from "./../components/CommentsSection";
import { toggleSubscription } from "../api/subscriptions.auth";
import VideoPlayer from "../components/video/VideoPlayer";
import SaveToPlaylist from "../components/SaveToPlaylist";
import { formatSubscriberCount, formatViews, formatTimeAgo } from "../utils/formatViews";
import { toast } from "react-toastify";
import {
  FiThumbsUp,
  FiShare2,
  FiCheck,
  FiUser,
  FiClock,
  FiEye,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

/**
 * VideoDetails (Watch Page) Component
 * 
 * Provides an immersive video watching experience:
 * 1. Responsive 16:9 cinematic video player.
 * 2. Channel info header with dynamic subscribe toggle & subscriber count.
 * 3. Video engagement action bar (Like toggle, Share to clipboard, Save to playlist).
 * 4. Expandable rich description box with view statistics and publish date.
 * 5. Full integrated comments section.
 */
const VideoDetails = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [liking, setLiking] = useState(false);

  const [subscriberCount, setSubscriberCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

  // Fetch video details on mount or when videoId changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    getVideoById(videoId)
      .then((res) => {
        const { video, isLiked, isSubscribed, subscriberCount, likesCount } =
          res.data.data;

        setVideo(video);
        setLiked(Boolean(isLiked));
        setSubscribed(Boolean(isSubscribed));
        setSubscriberCount(Number(subscriberCount) || 0);
        setLikesCount(Number(likesCount) || 0);
      })
      .catch((err) => setError(err?.response?.data?.message || err.message || "Failed to load video"))
      .finally(() => setLoading(false));
  }, [videoId]);

  // Like / Unlike video with optimistic UI update
  const likeHandler = async () => {
    if (liking) return;
    setLiking(true);

    try {
      const res = await likeVideo(videoId);
      const isNowLiked = res.data.data.liked;

      setLiked(isNowLiked);
      setLikesCount((prev) => (isNowLiked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update like status");
    } finally {
      setLiking(false);
    }
  };

  // Subscribe / Unsubscribe channel with optimistic count update
  const handleSubscribe = async () => {
    if (!video?.owner?._id || subscribing) return;
    setSubscribing(true);

    try {
      const res = await toggleSubscription(video.owner._id);
      const isNowSubscribed = res.data.data.subscribed;

      setSubscribed(isNowSubscribed);
      setSubscriberCount((prev) =>
        isNowSubscribed ? prev + 1 : Math.max(0, prev - 1)
      );

      toast.info(isNowSubscribed ? "Subscribed to channel" : "Unsubscribed from channel");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update subscription");
    } finally {
      setSubscribing(false);
    }
  };

  // Share video link to user's clipboard
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Video link copied to clipboard!");
  };

  const channelHandle = video?.owner?.username || "";
  const channelName = video?.owner?.fullname || video?.owner?.username || "Creator";
  const channelAvatar = video?.owner?.avatar;

  if (loading) {
    return (
      <div className="video-details video-details--loading">
        <div className="video-details__playerSkeleton"></div>
        <div className="video-details__metaSkeleton">
          <div className="skeleton-line" style={{ width: "70%", height: "24px" }}></div>
          <div className="skeleton-line" style={{ width: "40%", height: "16px" }}></div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="state state--error">
        <p className="state__title">Unable to load video</p>
        <p className="state__text">{error || "The requested video could not be found."}</p>
        <div className="state__actions">
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="video-details-layout">
      <div className="video-details">
        {/* Responsive Theater Video Player */}
        <section className="video-details__playerWrap">
          <VideoPlayer
            videoFile={video.videoFile}
            thumbnail={video.thumbnail}
            title={video.title}
          />
        </section>

        {/* Video Title */}
        <h1 className="video-details__title">{video.title}</h1>

        {/* Channel Info & Action Buttons Bar */}
        <div className="video-details__toolbar">
          {/* Left: Channel Profile info */}
          <div className="video-details__channel">
            <Link to={`/c/${channelHandle}`} className="video-details__avatarLink">
              {channelAvatar ? (
                <img
                  src={channelAvatar}
                  alt={channelName}
                  className="video-details__avatar"
                />
              ) : (
                <div className="video-details__avatar video-details__avatar--placeholder">
                  <FiUser />
                </div>
              )}
            </Link>

            <div className="video-details__channelMeta">
              <Link to={`/c/${channelHandle}`} className="video-details__channelName">
                {channelName}
              </Link>
              <span className="video-details__subCount">
                {formatSubscriberCount(subscriberCount)} subscribers
              </span>
            </div>

            <button
              type="button"
              className={`video-details__subBtn ${
                subscribed ? "video-details__subBtn--subscribed" : "video-details__subBtn--active"
              }`}
              onClick={handleSubscribe}
              disabled={subscribing}
            >
              {subscribing ? (
                "Updating..."
              ) : subscribed ? (
                <>
                  <FiCheck /> Subscribed
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>

          {/* Right: Engagement Actions (Like, Share, Save) */}
          <div className="video-details__actions">
            <button
              type="button"
              className={`video-details__actionBtn ${liked ? "video-details__actionBtn--liked" : ""}`}
              onClick={likeHandler}
              disabled={liking}
              title={liked ? "Unlike video" : "Like video"}
            >
              <FiThumbsUp className="video-details__actionIcon" />
              <span>{likesCount}</span>
            </button>

            <button
              type="button"
              className="video-details__actionBtn"
              onClick={handleShare}
              title="Share link"
            >
              <FiShare2 className="video-details__actionIcon" />
              <span>Share</span>
            </button>

            <SaveToPlaylist videoId={videoId} />
          </div>
        </div>

        {/* Expandable Video Description Box */}
        <div
          className={`video-details__descriptionCard ${descExpanded ? "video-details__descriptionCard--expanded" : ""}`}
          onClick={() => !descExpanded && setDescExpanded(true)}
        >
          <div className="video-details__metaInfo">
            <span className="video-details__stat">
              <FiEye /> {formatViews(video.views)}
            </span>
            <span className="video-details__dot">•</span>
            <span className="video-details__stat">
              <FiClock /> {video.createdAt ? formatTimeAgo(video.createdAt) : "Recently"}
            </span>
          </div>

          <p className="video-details__descriptionText">
            {video.description || "No description provided."}
          </p>

          {video.description && video.description.length > 120 && (
            <button
              type="button"
              className="video-details__expandToggle"
              onClick={(e) => {
                e.stopPropagation();
                setDescExpanded((prev) => !prev);
              }}
            >
              {descExpanded ? (
                <>Show less <FiChevronUp /></>
              ) : (
                <>Show more <FiChevronDown /></>
              )}
            </button>
          )}
        </div>

        {/* Integrated Video Comments */}
        <CommentsSection videoId={videoId} />
      </div>
    </div>
  );
};

export default VideoDetails;

