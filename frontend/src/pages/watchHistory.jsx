import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserHistory } from "../api/user.api";
import VideoCard from "../components/video/VideoCard";
import { FiClock, FiFilm } from "react-icons/fi";

/**
 * WatchHistory Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Displays the user's chronological video watch history (strictly max 3 videos per row).
 */
const WatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserHistory()
      .then((res) => setHistory(res?.data?.data || []))
      .catch(() => setError("Failed to load watch history"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
      <header className="pb-4 border-b border-white/[0.07]">
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight m-0">Watch History</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 m-0">Chronological archive of creations you have watched.</p>
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

        {!loading && error && (
          <div className="p-6 rounded-2xl bg-[#111317] border border-white/[0.08] text-center max-w-lg mx-auto my-8">
            <p className="text-base font-semibold text-white mb-1">Couldn’t load watch history</p>
            <p className="text-xs text-zinc-400 m-0">{error}</p>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#111317] rounded-2xl border border-white/[0.08] text-center px-4 max-w-md mx-auto">
            <FiClock className="text-3xl text-zinc-500 mb-3 opacity-80" />
            <p className="text-base font-semibold text-zinc-200 mb-1">No watch history yet</p>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs">Creations you watch will automatically be recorded here.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs shadow-xs transition-all no-underline tactile-btn"
            >
              Browse Creations
            </Link>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6">
            {history.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchHistory;




