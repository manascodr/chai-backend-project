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
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-8">
      <header className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">Watch History</h1>
        <p className="text-sm text-zinc-400 mt-1 m-0">All the creations you have experienced recently on VividStream.</p>
      </header>

      <div>
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-5">
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
          <div className="p-8 rounded-3xl bg-[#121215] border border-amber-500/20 text-center max-w-xl mx-auto my-8">
            <p className="text-lg font-bold text-amber-400 mb-1">Couldn’t load watch history</p>
            <p className="text-sm text-zinc-400 m-0">{error}</p>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#121215] rounded-3xl border border-white/10 text-center px-4 max-w-lg mx-auto">
            <FiClock className="text-4xl text-amber-400/60 mb-3 opacity-80" />
            <p className="text-lg font-bold text-zinc-200 mb-1">No watch history yet</p>
            <p className="text-sm text-zinc-400 mb-6 max-w-xs">Creations you watch will automatically be recorded here.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all no-underline"
            >
              <FiFilm /> Browse Creations
            </Link>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-5">
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




