import { formatSubscriberCount } from "../utils/formatViews";
import { useAuthStore } from "../stores/auth.store";
import { Link } from "react-router-dom";
import { FiCheck, FiBell, FiEdit3, FiUser, FiFilm } from "react-icons/fi";

/**
 * ChannelHeader Component
 * 
 * Renders the top profile identity for a creator's channel:
 * 1. Wide panoramic cover banner with vivid gradient fallback.
 * 2. Elevated circular avatar with glowing border.
 * 3. Creator name, handle, subscriber count, and bio.
 * 4. Contextual CTA: "Edit Profile" (for channel owner) vs "Subscribe / Subscribed" (for visitors).
 */
const ChannelHeader = ({
  channel,
  isSubscribed,
  subscriberCount,
  onToggleSubscribe,
  isSubscribeLoading = false,
}) => {
  const currentUser = useAuthStore((s) => s.user);
  if (!channel) return null;

  const { fullname, username, coverImage, avatar } = channel;

  const isOwnChannel = Boolean(
    currentUser &&
      channel &&
      ((currentUser._id && channel._id && currentUser._id === channel._id) ||
        (currentUser.username &&
          username &&
          currentUser.username.toLowerCase() === username.toLowerCase()))
  );

  return (
    <header className="channel-header">
      {/* Cover Banner */}
      <div className="channel-header-banner">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${fullname}'s banner`}
            className="channel-header-banner-img"
            loading="lazy"
          />
        ) : (
          <div className="channel-header-banner-placeholder" />
        )}
      </div>

      {/* Channel Profile Info & Actions */}
      <div className="channel-header-content">
        <div className="channel-header-info">
          {/* Avatar */}
          <div className="channel-header-avatar">
            {avatar ? (
              <img
                src={avatar}
                alt={fullname}
                className="channel-header-avatar-img"
                loading="lazy"
              />
            ) : (
              <div className="channel-header-avatar-img channel-header-avatar-img--placeholder">
                <FiUser />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="channel-header-details">
            <h1 className="channel-header-name">{fullname}</h1>
            <div className="channel-header-meta">
              <span className="channel-header-username">@{username}</span>
              <span className="channel-header-separator" aria-hidden="true">•</span>
              <span className="channel-header-subscribers">
                {formatSubscriberCount(subscriberCount)} subscribers
              </span>
            </div>
            <p className="channel-header-description">
              Welcome to my official VividStream channel! Check out my latest videos below.
            </p>
          </div>

          {/* Actions: Edit Profile (Own) or Subscribe Toggle (Visitor) */}
          <div className="channel-header-actions">
            {isOwnChannel ? (
              <Link to="/profile-settings" className="btn btn-secondary channel-header-edit-btn">
                <FiEdit3 /> Customize Channel
              </Link>
            ) : (
              <button
                type="button"
                className={`channel-header-subscribe-btn ${
                  isSubscribed ? "is-subscribed" : ""
                }`}
                onClick={onToggleSubscribe}
                disabled={isSubscribeLoading}
              >
                {isSubscribeLoading ? (
                  "Updating..."
                ) : isSubscribed ? (
                  <>
                    <FiCheck /> Subscribed
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Channel Navigation Sub-Tabs */}
        <div className="channel-header-tabs" role="tablist">
          <div className="channel-header-tab channel-header-tab--active">
            <FiFilm /> Videos
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChannelHeader;

