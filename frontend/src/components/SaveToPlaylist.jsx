import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  addToPlaylist,
  getMyPlaylists,
  removeFromPlaylist,
} from "../api/playlist.api";
import { FiBookmark, FiCheck, FiFolderPlus, FiX } from "react-icons/fi";

/**
 * SaveToPlaylist Component
 * 
 * Floating popup modal to easily add or remove the current video
 * across user-created playlists with live state synchronization.
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
    <div className="save-to-playlist" ref={containerRef}>
      <button
        className="video-details__actionBtn"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="saveToPlaylistPanel"
        disabled={disabled}
        title="Save to playlist"
      >
        <FiBookmark className="video-details__actionIcon" />
        <span>Save</span>
      </button>

      {open && (
        <div className="save-to-playlist__panel" id="saveToPlaylistPanel" role="dialog">
          <div className="save-to-playlist__header">
            <p className="save-to-playlist__title">Save video to...</p>
            <button
              type="button"
              className="save-to-playlist__close"
              onClick={() => setOpen(false)}
              aria-label="Close modal"
            >
              <FiX />
            </button>
          </div>

          {loading && (
            <div className="save-to-playlist__loading">
              <div className="spinner" style={{ width: "22px", height: "22px" }} />
            </div>
          )}

          {error && !loading && (
            <p className="save-to-playlist__state">{error}</p>
          )}

          {!loading && !error && (
            <div className="save-to-playlist__list">
              {playlists.length === 0 ? (
                <p className="save-to-playlist__state">No playlists found. Create one from the Playlists page.</p>
              ) : (
                playlists.map((pl) => {
                  const checked = hasVideo(pl);
                  const busy = togglingId === pl._id;

                  return (
                    <label key={pl._id} className="save-to-playlist__item">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={busy}
                        onChange={() => onToggle(pl._id, checked)}
                      />
                      <span className="save-to-playlist__name">{pl.name}</span>
                      {checked && (
                        <span className="save-to-playlist__status save-to-playlist__status--saved">
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

