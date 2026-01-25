import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  addToPlaylist,
  getMyPlaylists,
  removeFromPlaylist,
} from "../api/playlist.api";

const SaveToPlaylist = ({ videoId, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

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
    <div className="save-to-playlist">
      <button
        className="save-to-playlist__button"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="saveToPlaylistPanel"
        disabled={disabled}
      >
        Save
      </button>

      {open && (
        <div className="save-to-playlist__panel" id="saveToPlaylistPanel" role="dialog">
          <p className="save-to-playlist__title">Save to playlist</p>

          {loading && <p className="save-to-playlist__state">Loading...</p>}
          {error && !loading && (
            <p className="save-to-playlist__state">{error}</p>
          )}

          {!loading && !error && (
            <div className="save-to-playlist__list">
              {playlists.length === 0 ? (
                <p className="save-to-playlist__state">No playlists yet.</p>
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
                      <span
                        className={
                          checked
                            ? "save-to-playlist__status save-to-playlist__status--saved"
                            : "save-to-playlist__status"
                        }
                      >
                        {checked ? "Saved" : "Not saved"}
                      </span>
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
