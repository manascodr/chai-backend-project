import { useEffect, useState } from "react";
import { getLikedVideos } from "../api/like.api";
import VideoCard from "../components/video/VideoCard";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FiThumbsUp, FiFilm } from "react-icons/fi";

/**
 * LikedVideos Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Displays all creations that the current user has liked (strictly max 3 videos per row).
 */
const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalVideos, setTotalVideos] = useState(0);

  useEffect(() => {
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
  }, []);

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">Liked Creations</h1>
          <p className="text-sm text-zinc-400 mt-1 m-0">All the videos and masterclasses you’ve curated with high praise.</p>
        </div>

        {!loading && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#141418] border border-white/10 text-zinc-300 self-start sm:self-auto shadow-sm">
            <FiThumbsUp className="text-amber-400" /> {totalVideos} {totalVideos === 1 ? "creation" : "creations"}
          </span>
        )}
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

        {!loading && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#121215] rounded-3xl border border-white/10 text-center px-4 max-w-lg mx-auto">
            <FiThumbsUp className="text-4xl text-amber-400/60 mb-3 opacity-80" />
            <p className="text-lg font-bold text-zinc-200 mb-1">No liked creations yet</p>
            <p className="text-sm text-zinc-400 mb-6 max-w-xs">Like creations you enjoy to save them directly in this list.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all no-underline"
            >
              <FiFilm /> Discover Creations
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




