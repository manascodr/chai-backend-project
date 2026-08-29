import { Link } from "react-router-dom";
import { formatViews, formatTimeAgo } from "../../utils/formatViews";
import { FiPlay, FiUser } from "react-icons/fi";

/**
 * VideoCard Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Designer studio video card:
 * - 16:9 thumbnail with scale-on-hover effect and warm amber ambient highlight.
 * - Dynamic view count and relative time.
 * - Interactive channel avatar and username linking to creator profile.
 * - 2-line clamped title.
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
    <article className="flex flex-col group cursor-pointer transition-all duration-300">
      {/* 16:9 Thumbnail Link */}
      <Link to={`/watch/${_id}`} className="block no-underline" title={title}>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#121215] border border-white/[0.08] group-hover:border-amber-500/40 transition-all duration-300 shadow-sm group-hover:shadow-amber-500/10 group-hover:shadow-lg">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#121215] text-zinc-700">
              <FiPlay className="text-4xl opacity-40" />
            </div>
          )}

          {/* Hover Play Icon Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 text-lg shadow-xl shadow-amber-500/50 group-hover:scale-110 transition-transform">
              <FiPlay className="fill-current ml-0.5" />
            </span>
          </div>
        </div>
      </Link>

      {/* Video Details (Avatar + Info) */}
      <div className="flex items-start gap-3 mt-3.5 px-0.5">
        {channelUsername ? (
          <Link
            to={`/c/${channelUsername}`}
            className="shrink-0 no-underline"
            title={`Visit ${ownerName}'s channel`}
            onClick={(e) => e.stopPropagation()}
          >
            {ownerAvatar ? (
              <img
                className="w-9 h-9 rounded-full object-cover border border-white/10 hover:border-amber-500 transition-all hover:scale-105"
                src={ownerAvatar}
                alt={ownerName}
                loading="lazy"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-amber-400 text-xs font-bold border border-white/10">
                <FiUser />
              </div>
            )}
          </Link>
        ) : (
          <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-amber-400 text-xs font-bold border border-white/10 shrink-0">
            <FiUser />
          </div>
        )}

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <Link to={`/watch/${_id}`} className="no-underline text-inherit" title={title}>
            <h3 className="text-[15px] font-semibold text-zinc-100 group-hover:text-amber-400 line-clamp-2 leading-snug transition-colors m-0">
              {title}
            </h3>
          </Link>

          {channelUsername ? (
            <Link
              to={`/c/${channelUsername}`}
              className="text-xs text-zinc-400 hover:text-zinc-200 font-medium truncate no-underline transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {ownerName}
            </Link>
          ) : (
            <span className="text-xs text-zinc-400 font-medium truncate">{ownerName}</span>
          )}

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-normal">
            <span>{formatViews(views)}</span>
            {createdAt && (
              <>
                <span className="text-[8px] opacity-60">•</span>
                <span>{formatTimeAgo(createdAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;




