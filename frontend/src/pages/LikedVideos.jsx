import { useEffect, useState } from "react";
import { getLikedVideos } from "../api/like.api";
import VideoCard from "../components/video/VideoCard";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { FiThumbsUp, FiFilm, FiLogIn } from "react-icons/fi";

/**
 * LikedVideos Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Displays all creations that the current user has liked (strictly max 3 videos per row).
 */
const LikedVideos = () => {
  const user = useAuthStore((s) => s.user);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalVideos, setTotalVideos] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getLikedVideos()
      .then((res) => {
        setVideos(res?.data?.data?.videos || []);
        setTotalVideos(res?.data?.data?.total || 0);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch liked videos");
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight m-0">Liked Creations</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 m-0">Creations and masterclasses you have saved with appreciation.</p>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center py-20 bg-[#111317] rounded-3xl border border-white/[0.08] text-center px-4 max-w-md mx-auto my-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-4 border border-amber-500/20">
            <FiThumbsUp />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Save your favorite creations</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mb-6 max-w-xs leading-relaxed">
            Liked videos are only saved to registered accounts. Sign in to view and manage your liked creations.
          </p>
          <Link
            to="/login"
            state={{ from: "/liked-videos" }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all no-underline tactile-btn"
          >
            <FiLogIn className="text-base stroke-[2.5]" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight m-0">Liked Creations</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 m-0">Creations and masterclasses you have saved with appreciation.</p>
        </div>

        {!loading && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-[#111317] border border-white/[0.08] text-zinc-300 self-start sm:self-auto tabular-nums">
            <FiThumbsUp className="text-zinc-400 text-xs" /> {totalVideos} {totalVideos === 1 ? "creation" : "creations"}
          </span>
        )}
      </header>

      <div>
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="w-full aspect-video rounded-2xl bg-[#121215] border border-white/5" />
                <div className="flex items-start gap-3 mt-1.5 px-0.5">
                  <div className="w-9 h-9 rounded-full bg-[#18181d] shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 bg-[#18181d] rounded-md w-11/12" />
                    <div className="h-3 bg-[#18181d] rounded-md w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#111317] rounded-2xl border border-white/[0.08] text-center px-4 max-w-md mx-auto">
            <FiThumbsUp className="text-3xl text-zinc-500 mb-3 opacity-80" />
            <p className="text-base font-semibold text-zinc-200 mb-1">No liked creations yet</p>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs">Creations you appreciate will be collected here.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs shadow-xs transition-all no-underline tactile-btn"
            >
              Explore Creations
            </Link>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-5">
            {videos.map((v) => (
              <VideoCard key={v._id} video={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedVideos;




