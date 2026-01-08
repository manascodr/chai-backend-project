import { useParams } from "react-router-dom";
import { getUserChannelProfile } from "../api/user.api";
import { toggleSubscription } from "../api/subscriptions.auth";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../styles/components/_channel-header.scss";

const ChannelHeader = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getUserChannelProfile(username)
      .then((res) => {
        const data = res.data.data;
        setChannel(data);
        setIsSubscribed(data.isSubscribed);
        setSubscriberCount(data.subscribersCount);
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load channel"))
      .finally(() => setLoading(false));
  }, [username]);

  const handleSubscribe = async () => {
    if (!channel?._id) return;
    
    try {
      await toggleSubscription(channel._id);
      setIsSubscribed(!isSubscribed);
      setSubscriberCount(prev => isSubscribed ? prev - 1 : prev + 1);
      toast.success(isSubscribed ? "Unsubscribed" : "Subscribed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update subscription");
    }
  };

  const formatSubscriberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count?.toString() || "0";
  };

  if (loading) {
    return (
      <div className="channel-header channel-header--loading">
        <div className="channel-header__banner-skeleton"></div>
        <div className="channel-header__info-skeleton">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-text"></div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="channel-header channel-header--error">
        <p>Channel not found</p>
      </div>
    );
  }

  return (
    <div className="channel-header">
      {/* Banner / Cover Image */}
      <div className="channel-header__banner">
        {channel.coverImage ? (
          <img
            src={channel.coverImage}
            alt={`${channel.fullname}'s banner`}
            className="channel-header__banner-img"
          />
        ) : (
          <div className="channel-header__banner-placeholder"></div>
        )}
      </div>

      {/* Channel Info Section */}
      <div className="channel-header__content">
        <div className="channel-header__info">
          {/* Avatar */}
          <div className="channel-header__avatar">
            <img
              src={channel.avatar || "/default-avatar.png"}
              alt={channel.fullname}
              className="channel-header__avatar-img"
            />
          </div>

          {/* Channel Details */}
          <div className="channel-header__details">
            <h1 className="channel-header__name">{channel.fullname}</h1>
            <div className="channel-header__meta">
              <span className="channel-header__username">@{channel.username}</span>
              <span className="channel-header__separator">•</span>
              <span className="channel-header__subscribers">
                {formatSubscriberCount(subscriberCount)} subscribers
              </span>
            </div>
            <p className="channel-header__description">
              Welcome to my channel!
            </p>
          </div>

          {/* Subscribe Button */}
          <div className="channel-header__actions">
            <button
              className={`channel-header__subscribe-btn ${isSubscribed ? "channel-header__subscribe-btn--subscribed" : ""}`}
              onClick={handleSubscribe}
            >
              {isSubscribed ? (
                <>
                  <svg
                    className="channel-header__bell-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                  </svg>
                  Subscribed
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
        </div>

        {/* Channel Navigation Tabs */}
        <nav className="channel-header__tabs">
          <button className="channel-header__tab channel-header__tab--active">
            Home
          </button>
          <button className="channel-header__tab">Videos</button>
          <button className="channel-header__tab">Playlists</button>
          <button className="channel-header__tab">Community</button>
          <button className="channel-header__tab">About</button>
        </nav>
      </div>
    </div>
  );
};

export default ChannelHeader;
