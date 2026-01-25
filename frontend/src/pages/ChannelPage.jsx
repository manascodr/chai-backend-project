import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import ChannelHeader from "../components/ChannelHeader";
import ChannelVideos from "../components/ChannelVideos";
import { getUserChannelProfile } from "../api/user.api";
import { toggleSubscription } from "../api/subscriptions.auth";

const ChannelPageHeaderSkeleton = () => {
  return (
    <div className="channel-page-header-skeleton">
      <div className="channel-page-banner-skeleton" />
      <div className="channel-page-header-row-skeleton">
        <div className="channel-page-avatar-skeleton" />
        <div className="channel-page-text-skeleton" />
      </div>
    </div>
  );
};

const ChannelPage = () => {
  const { username } = useParams();

  const [channel, setChannel] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setErrorMessage("");
    setChannel(null);

    getUserChannelProfile(username)
      .then((res) => {
        if (cancelled) return;
        const data = res.data.data;
        setChannel(data);
        setIsSubscribed(Boolean(data.isSubscribed));
        setSubscriberCount(Number(data.subscribersCount) || 0);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err.response?.data?.message || "Failed to load channel";
        setErrorMessage(message);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const handleToggleSubscribe = async () => {
    if (!channel?._id || isSubscribeLoading) return;

    try {
      setIsSubscribeLoading(true);
      await toggleSubscription(channel._id);
      setIsSubscribed((prev) => {
        const next = !prev;
        setSubscriberCount((countPrev) =>
          next ? countPrev + 1 : countPrev - 1
        );
        return next;
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update subscription"
      );
    } finally {
      setIsSubscribeLoading(false);
    }
  };

  return (
    <section className="page page--channel channel-page">
      <div className="page__content">
        {isLoading && <ChannelPageHeaderSkeleton />}

        {!isLoading && errorMessage && (
          <div className="state state--error">
            <p className="state__title">Couldn’t load channel</p>
            <p className="state__text">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && (
          <>
            <ChannelHeader
              channel={channel}
              isSubscribed={isSubscribed}
              subscriberCount={subscriberCount}
              onToggleSubscribe={handleToggleSubscribe}
              isSubscribeLoading={isSubscribeLoading}
            />

            <section className="channel-page-content">
              <ChannelVideos />
            </section>
          </>
        )}
      </div>
    </section>
  );
};

export default ChannelPage;
