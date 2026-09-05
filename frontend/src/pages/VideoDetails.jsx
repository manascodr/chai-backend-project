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
import { FaUsers } from "react-icons/fa";
import { set } from "react-hook-form";

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
      setLiked((prev) => !prev); // Revert optimistic update on error
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
        <p className="text-xl font-semibold text-white mb-2">Unable to load video</p>
        <p className="text-sm text-zinc-400 mb-6">{error || "The requested video could not be found."}</p>
        <Link to="/" className="inline-flex items-center px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-sm shadow-xs transition-all tactile-btn">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* 16:9 Cinema Player with Ambient Backlight */}
      <div className="cinema-ambient">
        <section className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl shadow-black/90">
          <VideoPlayer
            videoFile={video.videoFile}
            thumbnail={video.thumbnail}
            title={video.title}
          />
        </section>
      </div>

      {/* Video Title */}
      <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight leading-snug m-0">
        {video.title}
      </h1>

      {/* Channel Bar & Unified Action Dock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        {/* Left: Channel Info & Subscribe */}
        <div className="flex items-center gap-3.5">
          <Link to={`/c/${channelHandle}`} className="shrink-0 no-underline">
            {channelAvatar ? (
              <img
                src={channelAvatar}
                alt={channelName}
                className="w-10 h-10 rounded-full object-cover border border-white/[0.1] hover:border-white/40 transition-all hover:scale-105"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#181a20] flex items-center justify-center text-zinc-300 font-medium border border-white/[0.08]">
                <FiUser />
              </div>
            )}
          </Link>

          <div className="flex flex-col">
            <Link to={`/c/${channelHandle}`} className="font-semibold text-zinc-100 text-sm sm:text-base hover:text-white transition-colors no-underline">
              {channelName}
            </Link>
            <span className="text-xs text-zinc-400 tabular-nums">
              {formatSubscriberCount(subscriberCount)} subscribers
            </span>
          </div>

          <button
            type="button"
            className={`ml-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer tactile-btn ${
              subscribed
                ? "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] flex items-center gap-1.5"
                : "bg-white hover:bg-zinc-200 text-zinc-950 shadow-xs"
            }`}
            onClick={handleSubscribe}
            disabled={subscribing}
          >
            {subscribing ? (
              "Updating..."
            ) : subscribed ? (
              <>
                <FiCheck className="text-sm" /> Subscribed
              </>
            ) : (
              "Subscribe"
            )}
          </button>
        </div>

        {/* Right: Unified Action Dock */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Like Button */}
          <button
            type="button"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer tactile-btn ${
              liked
                ? "bg-white text-zinc-950 border-white shadow-xs"
                : "bg-[#111317] hover:bg-[#181a20] text-zinc-300 hover:text-zinc-100 border-white/[0.08] hover:border-white/[0.14]"
            }`}
            onClick={likeHandler}
            disabled={liking}
            title={liked ? "Unlike video" : "Like video"}
          >
            <FiThumbsUp className="text-sm" />
            <span className="tabular-nums">{likesCount}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111317] hover:bg-[#181a20] text-zinc-300 hover:text-zinc-100 text-xs sm:text-sm font-medium border border-white/[0.08] hover:border-white/[0.14] transition-all cursor-pointer tactile-btn"
            onClick={handleShare}
            title="Copy link to clipboard"
          >
            <FiShare2 className="text-sm" />
            <span>Share</span>
          </button>

          {/* Watch Party Button */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111317] hover:bg-[#181a20] text-zinc-300 hover:text-white border border-white/[0.08] hover:border-white/[0.2] text-xs sm:text-sm font-medium transition-all cursor-pointer tactile-btn"
            onClick={() => {
              const partyRoomId = `party_${videoId}_${Math.random().toString(36).substring(2, 8)}`;
              navigate(`/watch-party/${partyRoomId}?v=${videoId}`);
            }}
            title="Start a synchronized Watch Party"
          >
            <FaUsers className="text-sm" />
            <span>Watch Party</span>
          </button>

          {/* Playlist Save */}
          <SaveToPlaylist videoId={videoId} />
        </div>
      </div>

      {/* Expandable Editorial Description Box */}
      <div
        className="bg-[#111317] hover:bg-[#15171d] border border-white/[0.07] hover:border-white/[0.12] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all cursor-pointer shadow-xs"
        onClick={() => !descExpanded && setDescExpanded(true)}
      >
        <div className="flex items-center gap-3 text-xs font-medium text-zinc-300 tabular-nums">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-200">
            <FiEye className="text-xs" /> {formatViews(video.views)}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400">
            <FiClock className="text-xs" /> {video.createdAt ? formatTimeAgo(video.createdAt) : "Recently"}
          </span>
        </div>

        <p className={`text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap m-0 font-normal ${!descExpanded ? "line-clamp-3" : ""}`}>
          {video.description || "No description provided for this creation."}
        </p>

        {video.description && video.description.length > 120 && (
          <button
            type="button"
            className="self-start inline-flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white mt-0.5 cursor-pointer tactile-btn"
            onClick={(e) => {
              e.stopPropagation();
              setDescExpanded((prev) => !prev);
            }}
          >
            {descExpanded ? (
              <>Show less <FiChevronUp /></>
            ) : (
              <>Read more <FiChevronDown /></>
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




