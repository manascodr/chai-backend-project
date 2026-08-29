import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getChannelVideos } from "../api/user.api";
import { useParams } from "react-router-dom";
import VideoCard from "./video/VideoCard";
import { FiFilm } from "react-icons/fi";

/**
 * ChannelVideos Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Displays creator video showcase (strictly maximum 3 videos per row).
 */
const ChannelVideos = () => {
  const { username } = useParams();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    getChannelVideos(username)
      .then((res) => {
        if (cancelled) return;
        setVideos(res?.data?.data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err?.response?.data?.message || "Failed to load channel videos";
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 animate-pulse">
            <div className="w-full aspect-video rounded-2xl bg-[#121215] border border-white/5" />
            <div className="flex flex-col gap-2 px-0.5">
              <div className="h-4 bg-[#18181d] rounded w-11/12" />
              <div className="h-3 bg-[#18181d] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-[#121215] border border-amber-500/20 text-center">
        <p className="text-base font-bold text-amber-400 mb-1">Could not load videos</p>
        <p className="text-sm text-zinc-400 m-0">{error}</p>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-[#121215] rounded-3xl border border-white/10">
        <FiFilm className="text-4xl text-amber-400/60 mb-3 opacity-80" />
        <p className="text-base font-bold text-zinc-200 mb-1">No creations yet</p>
        <p className="text-sm text-zinc-400 max-w-sm m-0">This creator hasn't published any public videos yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-5">
      {videos.map((v) => (
        <VideoCard key={v._id} video={v} />
      ))}
    </div>
  );
};

export default ChannelVideos;




