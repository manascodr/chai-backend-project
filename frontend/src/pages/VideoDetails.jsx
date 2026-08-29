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
 * VideoDetails (Watch Page) Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Designer studio video cinema portal:
 * 1. 16:9 cinematic responsive video player container.
 * 2. Channel toolbar with amber subscribe toggle & subscriber count.
 * 3. Video engagement action bar (Like toggle, Share to clipboard, Save to playlist).
 * 4. Expandable rich obsidian description box with view statistics and publish date.
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4 animate-pulse">
        <div className="w-full aspect-video rounded-2xl bg-[#121215] border border-white/5" />
        <div className="h-6 bg-[#18181d] rounded-md w-3/4 mt-2" />
        <div className="h-4 bg-[#18181d] rounded-md w-1/3" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center flex flex-col items-center">
        <p className="text-xl font-bold text-amber-400 mb-2">Unable to load video</p>
        <p className="text-sm text-zinc-400 mb-6">{error || "The requested video could not be found."}</p>
        <Link to="/" className="inline-flex items-center px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
      {/* 16:9 Cinema Player */}
      <section className="w-full rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl shadow-black/80">
        <VideoPlayer
          videoFile={video.videoFile}
          thumbnail={video.thumbnail}
          title={video.title}
        />
      </section>

      {/* Video Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug m-0">
        {video.title}
      </h1>

      {/* Channel Info & Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        {/* Left: Channel Info & Subscribe */}
        <div className="flex items-center gap-3.5">
          <Link to={`/c/${channelHandle}`} className="shrink-0 no-underline">
            {channelAvatar ? (
              <img
                src={channelAvatar}
                alt={channelName}
                className="w-11 h-11 rounded-full object-cover border border-white/10 hover:border-amber-500 transition-transform hover:scale-105"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-zinc-900 flex items-center justify-center text-amber-400 font-bold border border-white/10">
                <FiUser />
              </div>
            )}
          </Link>

          <div className="flex flex-col">
            <Link to={`/c/${channelHandle}`} className="font-bold text-white text-base hover:text-amber-400 transition-colors no-underline">
              {channelName}
            </Link>
            <span className="text-xs text-zinc-400">
              {formatSubscriberCount(subscriberCount)} subscribers
            </span>
          </div>

          <button
            type="button"
            className={`ml-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              subscribed
                ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 flex items-center gap-1.5"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/25 hover:scale-105"
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
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
              liked
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/20"
                : "bg-[#141418] hover:bg-[#1c1c22] text-zinc-200 border-white/10 hover:border-white/20"
            }`}
            onClick={likeHandler}
            disabled={liking}
            title={liked ? "Unlike video" : "Like video"}
          >
            <FiThumbsUp className="text-base" />
            <span>{likesCount}</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141418] hover:bg-[#1c1c22] text-zinc-200 text-sm font-medium border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            onClick={handleShare}
            title="Share link"
          >
            <FiShare2 className="text-base" />
            <span>Share</span>
          </button>

          <SaveToPlaylist videoId={videoId} />
        </div>
      </div>

      {/* Expandable Video Description Box */}
      <div
        className="bg-[#121215] hover:bg-[#16161a] border border-white/[0.08] hover:border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5 transition-all text-sm cursor-pointer shadow-sm"
        onClick={() => !descExpanded && setDescExpanded(true)}
      >
        <div className="flex items-center gap-3 text-xs font-bold text-zinc-300">
          <span className="flex items-center gap-1.5 text-amber-400">
            <FiEye /> {formatViews(video.views)}
          </span>
          <span className="opacity-40">•</span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <FiClock /> {video.createdAt ? formatTimeAgo(video.createdAt) : "Recently"}
          </span>
        </div>

        <p className={`text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap m-0 ${!descExpanded ? "line-clamp-3" : ""}`}>
          {video.description || "No description provided."}
        </p>

        {video.description && video.description.length > 120 && (
          <button
            type="button"
            className="self-start inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 mt-1 cursor-pointer"
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

      {/* Integrated Video Comments Section */}
      <CommentsSection videoId={videoId} />
    </div>
  );
};

export default VideoDetails;




