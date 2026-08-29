import { Link } from "react-router-dom";
import { formatViews, formatTimeAgo } from "../../utils/formatViews";
import { FiPlay, FiUser } from "react-icons/fi";

/**
 * VideoCard Component
 * 
 * Renders a single video card in YouTube/Twitch style:
 * - 16:9 aspect ratio thumbnail with smooth hover zoom.
 * - Dynamic view count and relative time (e.g. "1.2K views • 2 days ago").
 * - Interactive channel avatar and username linking to creator's channel.
 * - Multi-line title truncation with tooltip.
 */
const VideoCard = ({ video }) => {
  if (!video) return null;

  const {
    _id,
    title = "Untitled video",
    thumbnail,
    views = 0,
    createdAt,
    owner = {},
  } = video;

  const ownerName = owner.fullname || owner.username || "Creator";
  const ownerAvatar = owner.avatar;
  const channelUsername = owner.username || "";

  return (
    <article className="video-card">
      {/* Clickable Thumbnail & Title linking to the video watch page */}
      <Link to={`/watch/${_id}`} className="video-card__link" title={title}>
        <div className="video-card__thumb">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title} 
              loading="lazy" 
              className="video-card__thumbImg"
              onError={(e) => {
                // Fallback placeholder if image link fails
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="video-card__thumbPlaceholder">
              <FiPlay className="video-card__thumbIcon" />
            </div>
          )}
          
          <div className="video-card__overlay">
            <span className="video-card__playBtn">
              <FiPlay />
            </span>
          </div>
        </div>
      </Link>

      {/* Video Information (Avatar + Title + Channel Meta) */}
      <div className="video-card__details">
        {channelUsername ? (
          <Link
            to={`/c/${channelUsername}`}
            className="video-card__avatarLink"
            title={`Visit ${ownerName}'s channel`}
            onClick={(e) => e.stopPropagation()}
          >
            {ownerAvatar ? (
              <img
                className="video-card__avatar"
                src={ownerAvatar}
                alt={ownerName}
                loading="lazy"
              />
            ) : (
              <div className="video-card__avatar video-card__avatar--placeholder">
                <FiUser />
              </div>
            )}
          </Link>
        ) : (
          <div className="video-card__avatar video-card__avatar--placeholder">
            <FiUser />
          </div>
        )}

        <div className="video-card__info">
          <Link to={`/watch/${_id}`} className="video-card__titleLink" title={title}>
            <h3 className="video-card__title">{title}</h3>
          </Link>

          {channelUsername ? (
            <Link
              to={`/c/${channelUsername}`}
              className="video-card__channelName"
              onClick={(e) => e.stopPropagation()}
            >
              {ownerName}
            </Link>
          ) : (
            <span className="video-card__channelName">{ownerName}</span>
          )}

          <div className="video-card__meta">
            <span className="video-card__views">{formatViews(views)}</span>
            {createdAt && (
              <>
                <span className="video-card__dot" aria-hidden="true">•</span>
                <span className="video-card__time">{formatTimeAgo(createdAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;

