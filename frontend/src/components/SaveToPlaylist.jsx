import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  addToPlaylist,
  getMyPlaylists,
  removeFromPlaylist,
} from "../api/playlist.api";
import { FiBookmark, FiCheck, FiX } from "react-icons/fi";

/**
 * SaveToPlaylist Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Floating popup modal to add/remove current video across user collections.
 */
const SaveToPlaylist = ({ videoId, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const containerRef = useRef(null);
  const isLoaded = useMemo(() => loaded, [loaded]);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getMyPlaylists();
      setPlaylists(res?.data?.data || []);
      setLoaded(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load playlists");
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (isLoaded) return;
    load();
  }, [open, isLoaded]);

  // Click outside to close dropdown modal
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const hasVideo = (playlist) => {
    const vids = playlist?.videos || [];
    return vids.some((v) => (v?._id || v) === videoId);
  };

  const onToggle = async (playlistId, currentlyHasVideo) => {
    if (togglingId) return;
    setTogglingId(playlistId);

    try {
      if (currentlyHasVideo) {
        await removeFromPlaylist(playlistId, videoId);
      } else {
        await addToPlaylist(playlistId, videoId);
      }

      setPlaylists((prev) =>
        prev.map((pl) => {
          if (pl._id !== playlistId) return pl;

          const vids = pl.videos || [];
          if (currentlyHasVideo) {
            return { ...pl, videos: vids.filter((v) => (v?._id || v) !== videoId) };
          }

          return { ...pl, videos: [...vids, { _id: videoId }] };
        })
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update playlist");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141418] hover:bg-[#1c1c22] text-zinc-200 text-sm font-medium border border-white/10 hover:border-white/20 transition-all cursor-pointer"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="saveToPlaylistPanel"
        disabled={disabled}
        title="Save to collection"
      >
        <FiBookmark className="text-base text-amber-400" />
        <span>Save</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-72 bg-[#141418] border border-amber-500/25 rounded-2xl shadow-2xl shadow-black/80 p-4 z-50 backdrop-blur-2xl flex flex-col gap-3"
          id="saveToPlaylistPanel"
          role="dialog"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <p className="text-sm font-bold text-white m-0">Save creation to...</p>
            <button
              type="button"
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              onClick={() => setOpen(false)}
              aria-label="Close modal"
            >
              <FiX className="text-base" />
            </button>
          </div>

          {loading && (
            <div className="flex justify-center py-4">
              <div className="spinner" style={{ width: "20px", height: "20px" }} />
            </div>
          )}

          {error && !loading && (
            <p className="text-xs text-amber-400 m-0 py-2 text-center">{error}</p>
          )}

          {!loading && !error && (
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              {playlists.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-3 m-0">
                  No collections found. Create one from the Playlists page.
                </p>
              ) : (
                playlists.map((pl) => {
                  const checked = hasVideo(pl);
                  const busy = togglingId === pl._id;

                  return (
                    <label
                      key={pl._id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/80 cursor-pointer text-sm transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-400 bg-[#09090b] w-4 h-4 cursor-pointer accent-amber-500"
                        checked={checked}
                        disabled={busy}
                        onChange={() => onToggle(pl._id, checked)}
                      />
                      <span className="text-zinc-200 text-sm font-medium flex-1 truncate">
                        {pl.name}
                      </span>
                      {checked && (
                        <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                          <FiCheck /> Saved
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SaveToPlaylist;




