import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ChannelHeader from "../components/ChannelHeader";
import ChannelVideos from "../components/ChannelVideos";
import { getUserChannelProfile } from "../api/user.api";
import { toggleSubscription } from "../api/subscriptions.auth";
import { useAuthStore } from "../stores/auth.store";

const ChannelPageHeaderSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse mb-8">
      <div className="w-full h-44 sm:h-56 md:h-64 rounded-3xl bg-slate-800" />
      <div className="flex items-end gap-5 px-4 -mt-14 sm:-mt-18">
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-700 border-4 border-[#0a0d16]" />
        <div className="h-6 bg-slate-800 rounded w-48 mb-4" />
      </div>
    </div>
  );
};

const ChannelPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

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
    if (!user) {
      toast.info("Please sign in to subscribe to channels");
      navigate("/login", { state: { from: `/c/${username}` } });
      return;
    }
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
    <div className="w-full px-4 sm:px-8 py-6">
      {isLoading && <ChannelPageHeaderSkeleton />}

      {!isLoading && errorMessage && (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center max-w-xl mx-auto my-12">
          <p className="text-lg font-bold text-rose-400 mb-1">Couldn’t load channel</p>
          <p className="text-sm text-slate-400 m-0">{errorMessage}</p>
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

          <section className="mt-6">
            <ChannelVideos />
          </section>
        </>
      )}
    </div>
  );
};

export default ChannelPage;

