import { formatSubscriberCount } from "../utils/formatViews";
import { useAuthStore } from "../stores/auth.store";

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
      {/* Banner / Cover Image */}
      <div className="channel-header-banner">
        {channel.coverImage ? (
          <img
            src={coverImage}
            alt={`${fullname}'s banner`}
            className="channel-header-banner-img"
          />
        ) : (
          <div className="channel-header-banner-placeholder"></div>
        )}
      </div>

      {/* Channel Info Section */}
      <div className="channel-header-content">
        <div className="channel-header-info">
          {/* Avatar */}
          <div className="channel-header-avatar">
            <img
              src={avatar || "/default-avatar.png"}
              alt={fullname}
              className="channel-header-avatar-img"
            />
          </div>

          {/* Channel Details */}
          <div className="channel-header-details">
            <h1 className="channel-header-name">{fullname}</h1>
            <div className="channel-header-meta">
              <span className="channel-header-username">
                @{username}
              </span>
              <span className="channel-header-separator">•</span>
              <span className="channel-header-subscribers">
                {formatSubscriberCount(subscriberCount)} subscribers
              </span>
            </div>
            <p className="channel-header-description">Welcome to my channel!</p>
          </div>

          {/* Subscribe Button (hidden on your own channel) */}
          {!isOwnChannel && (
            <div className="channel-header-actions">
              <button
                className={`channel-header-subscribe-btn ${
                  isSubscribed ? "is-subscribed" : ""
                }`}
                onClick={onToggleSubscribe}
                disabled={isSubscribeLoading}
              >
                {isSubscribed ? (
                  <>
                    <svg
                      className="channel-header-bell-icon"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                    </svg>
                    {isSubscribeLoading ? "Updating..." : "Subscribed"}
                  </>
                ) : isSubscribeLoading ? (
                  "Subscribing..."
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ChannelHeader;
