import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getPlaylistById, removeFromPlaylist } from "../api/playlist.api";
import VideoCard from "../components/video/VideoCard";
import { FiFolder, FiTrash2, FiFilm, FiArrowLeft } from "react-icons/fi";

/**
 * PlaylistDetails Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Displays all creations within a chosen playlist (strictly max 3 videos per row).
 */
const PlaylistDetails = () => {
  const { playlistId } = useParams();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const loadPlaylist = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getPlaylistById(playlistId);
      setPlaylist(res?.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load playlist");
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  const onRemove = async (videoId) => {
    if (removingId) return;
    setRemovingId(videoId);

    try {
      await removeFromPlaylist(playlistId, videoId);
      toast.info("Video removed from collection");
      await loadPlaylist();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove video");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
      {/* Back Link */}
      <Link
        to="/playlists"
        className="self-start inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-amber-400 transition-colors no-underline"
      >
        <FiArrowLeft /> Back to all Collections
      </Link>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="spinner" />
        </div>
      )}

      {!loading && error && (
        <div className="p-6 rounded-3xl bg-[#121215] border border-amber-500/20 text-center max-w-lg mx-auto">
          <p className="text-base font-bold text-amber-400 mb-1">Error loading collection</p>
          <p className="text-sm text-zinc-400 m-0">{error}</p>
        </div>
      )}

      {!loading && !error && !playlist && (
        <div className="flex flex-col items-center justify-center py-16 bg-[#121215] rounded-3xl border border-white/10 text-center px-4">
          <p className="text-base font-bold text-zinc-200 mb-1">Collection not found</p>
          <p className="text-xs text-zinc-500 m-0">The requested collection may have been deleted.</p>
        </div>
      )}

      {!loading && !error && playlist && (
        <>
          {/* Playlist Header */}
          <header className="flex items-center gap-4 pb-6 border-b border-white/[0.08]">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl shrink-0">
              <FiFolder />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">{playlist.name}</h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 m-0">
                {(playlist.videos?.length || 0).toString()} {(playlist.videos?.length || 0) === 1 ? "creation" : "creations"} in this collection
              </p>
            </div>
          </header>

          {/* Video List (Strictly 3 videos per row maximum) */}
          {(playlist.videos || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#121215] rounded-3xl border border-white/10 text-center px-4">
              <FiFilm className="text-4xl text-amber-400/60 mb-3 opacity-80" />
              <p className="text-base font-bold text-zinc-200 mb-1">This collection is empty</p>
              <p className="text-xs text-zinc-500 m-0">Browse creations and click "Save" to curate this collection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(playlist.videos || []).map((v) => {
                const videoForCard = {
                  ...v,
                  views: v?.views ?? 0,
                  owner: v?.owner ?? {},
                };

                return (
                  <article key={v._id} className="flex flex-col gap-2 group">
                    <VideoCard video={videoForCard} />

                    <button
                      type="button"
                      className="self-end inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all cursor-pointer"
                      onClick={() => onRemove(v._id)}
                      disabled={removingId === v._id}
                    >
                      <FiTrash2 /> {removingId === v._id ? "Removing..." : "Remove"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlaylistDetails;




