import { Link } from "react-router-dom";
import { formatViews, formatTimeAgo, formatDuration } from "../../utils/formatViews";
import { FiPlay, FiUser } from "react-icons/fi";

/**
 * VideoCard Component
 * 
 * Crafted with cinema-editorial aesthetic:
 * - 16:9 thumbnail frame with soft ambient elevation on hover.
 * - Monospaced timecode badge in bottom-right corner.
 * - Tabular view count and relative time.
 * - Human-centric typography and tactile creator avatar.
 */
const VideoCard = ({ video }) => {
  if (!video) return null;

  const {
    _id,
    title = "Untitled video",
    thumbnail,
    views = 0,
    duration,
    createdAt,
    owner = {},
  } = video;

  const ownerName = owner.fullname || owner.username || "Creator";
  const ownerAvatar = owner.avatar;
  const channelUsername = owner.username || "";
  const formattedDuration = formatDuration(duration);

  return (
    <article className="flex flex-col group cursor-pointer">
      {/* 16:9 Cinema Thumbnail */}
      <Link to={`/watch/${_id}`} className="block no-underline" title={title}>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#111317] border border-white/[0.07] group-hover:border-white/20 transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-black/60">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-500 ease-out"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#111317] text-zinc-700">
              <FiPlay className="text-3xl opacity-30" />
            </div>
          )}

          {/* Bottom subtle gradient vignette for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Time Duration Badge */}
          {formattedDuration && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[11px] font-mono tabular-nums font-medium text-zinc-200 border border-white/[0.1] shadow-xs">
              {formattedDuration}
            </div>
          )}

          {/* Hover Play Icon Cue */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-zinc-950 text-sm shadow-md group-hover:scale-105 transition-transform duration-200">
              <FiPlay className="fill-current ml-0.5" />
            </span>
          </div>
        </div>
      </Link>

      {/* Video Details (Avatar + Metadata) */}
      <div className="flex items-start gap-3 mt-3 px-0.5">
        {channelUsername ? (
          <Link
            to={`/c/${channelUsername}`}
            className="shrink-0 no-underline"
            title={`Channel: ${ownerName}`}
            onClick={(e) => e.stopPropagation()}
          >
            {ownerAvatar ? (
              <img
                className="w-8 h-8 rounded-full object-cover border border-white/[0.1] hover:border-white/40 transition-all hover:scale-105"
                src={ownerAvatar}
                alt={ownerName}
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#181a20] flex items-center justify-center text-zinc-300 text-xs font-medium border border-white/[0.08]">
                <FiUser />
              </div>
            )}
          </Link>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#181a20] flex items-center justify-center text-zinc-300 text-xs font-medium border border-white/[0.08] shrink-0">
            <FiUser />
          </div>
        )}

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <Link to={`/watch/${_id}`} className="no-underline text-inherit" title={title}>
            <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white line-clamp-2 leading-snug transition-colors duration-150 m-0">
              {title}
            </h3>
          </Link>

          <div className="flex flex-col">
            {channelUsername ? (
              <Link
                to={`/c/${channelUsername}`}
                className="text-xs text-zinc-400 hover:text-zinc-200 font-normal truncate no-underline transition-colors mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                {ownerName}
              </Link>
            ) : (
              <span className="text-xs text-zinc-400 font-normal truncate mt-0.5">{ownerName}</span>
            )}

            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-normal tabular-nums">
              <span>{formatViews(views)}</span>
              {createdAt && (
                <>
                  <span className="text-[7px] opacity-40">•</span>
                  <span>{formatTimeAgo(createdAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;




