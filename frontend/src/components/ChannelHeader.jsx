import { formatSubscriberCount } from "../utils/formatViews";
import { useAuthStore } from "../stores/auth.store";
import { Link } from "react-router-dom";
import { FiCheck, FiEdit3, FiUser, FiFilm } from "react-icons/fi";

/**
 * ChannelHeader Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Renders the studio identity for a creator's channel:
 * 1. Wide panoramic cover banner with obsidian atmosphere.
 * 2. Elevated circular avatar with amber ambient border.
 * 3. Creator name, handle, subscriber count.
 * 4. Contextual CTA: "Customize Channel" (for owner) vs "Subscribe" (for visitor).
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
    <header className="w-full flex flex-col mb-8">
      {/* Cover Banner */}
      <div className="w-full h-44 sm:h-56 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-950 via-[#121215] to-zinc-950 border border-white/[0.08] relative shadow-2xl">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${fullname}'s banner`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#09090b] via-[#15151a] to-[#09090b] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_50%)]" />
          </div>
        )}
      </div>

      {/* Channel Profile Info & Actions */}
      <div className="px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-14 sm:-mt-18 pb-6 border-b border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[#09090b] shadow-2xl overflow-hidden bg-[#121215] shrink-0 relative group">
              {avatar ? (
                <img
                  src={avatar}
                  alt={fullname}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-400 text-3xl font-bold">
                  <FiUser />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">
                {fullname}
              </h1>
              <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                <span className="text-amber-400 font-semibold">@{username}</span>
                <span>•</span>
                <span>{formatSubscriberCount(subscriberCount)} subscribers</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl leading-relaxed m-0">
                Welcome to my official VividStream studio! Explore recent videos, masterclasses, and updates below.
              </p>
            </div>
          </div>

          {/* Actions: Customize Channel vs Subscribe */}
          <div className="self-start sm:self-end">
            {isOwnChannel ? (
              <Link
                to="/profile-settings"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#141418] hover:bg-[#1c1c22] text-zinc-200 border border-white/10 hover:border-amber-500/30 text-sm font-semibold transition-all no-underline shadow-sm cursor-pointer"
              >
                <FiEdit3 className="text-amber-400" /> Customize Studio
              </Link>
            ) : (
              <button
                type="button"
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md cursor-pointer ${
                  isSubscribed
                    ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold shadow-amber-500/25 hover:scale-105"
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
        <div className="flex items-center gap-6 mt-4">
          <div className="inline-flex items-center gap-2 pb-3 text-sm font-bold text-amber-400 border-b-2 border-amber-400">
            <FiFilm /> Videos & Creations
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChannelHeader;




