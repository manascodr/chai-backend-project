import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getPlaylistById, removeFromPlaylist } from "../api/playlist.api";
import VideoCard from "../components/video/VideoCard";
import { FiFolder, FiTrash2, FiFilm, FiArrowLeft } from "react-icons/fi";

/**
 * PlaylistDetails Component
 * 
 * Displays all videos within a chosen playlist with:
 * 1. Back button to Playlists index.
 * 2. Responsive 16:9 VideoCard grid.
 * 3. Inline "Remove from Playlist" action.
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
      toast.info("Video removed from playlist");
      await loadPlaylist();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove video");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="page playlist-details">
      <div className="playlist-details__container">
        {/* Back Link */}
        <Link to="/playlists" className="btn btn-ghost playlist-details__backLink">
          <FiArrowLeft /> Back to all Playlists
        </Link>

        {loading && (
          <div className="playlists__loading">
            <div className="spinner" />
          </div>
        )}

        {!loading && error && (
          <div className="state state--error">
            <p className="state__title">Error loading playlist</p>
            <p className="state__text">{error}</p>
          </div>
        )}

        {!loading && !error && !playlist && (
          <div className="state state--empty">
            <p className="state__title">Playlist not found</p>
            <p className="state__text">The requested playlist may have been deleted.</p>
          </div>
        )}

        {!loading && !error && playlist && (
          <>
            {/* Playlist Header */}
            <header className="playlist-details__header">
              <div className="playlist-details__heading">
                <div className="playlist-details__iconBadge">
                  <FiFolder />
                </div>
                <div>
                  <h1 className="playlist-details__title">{playlist.name}</h1>
                  <p className="playlist-details__subtext">
                    {(playlist.videos?.length || 0).toString()} {(playlist.videos?.length || 0) === 1 ? "video" : "videos"} in this collection
                  </p>
                </div>
              </div>
            </header>

            {/* Video List */}
            {(playlist.videos || []).length === 0 ? (
              <div className="state state--empty">
                <FiFilm style={{ fontSize: "2.5rem", color: "var(--accent)", marginBottom: "0.5rem" }} />
                <p className="state__title">This playlist is empty</p>
                <p className="state__text">Browse videos and click "Save" to add them to this collection.</p>
              </div>
            ) : (
              <div className="playlist-details__grid">
                {(playlist.videos || []).map((v) => {
                  const videoForCard = {
                    ...v,
                    views: v?.views ?? 0,
                    owner: v?.owner ?? {},
                  };

                  return (
                    <article key={v._id} className="playlist-details__item">
                      <div className="playlist-details__card">
                        <VideoCard video={videoForCard} />
                      </div>

                      <div className="playlist-details__itemActions">
                        <button
                          type="button"
                          className="btn btn-ghost playlist-details__remove"
                          onClick={() => onRemove(v._id)}
                          disabled={removingId === v._id}
                        >
                          <FiTrash2 /> {removingId === v._id ? "Removing..." : "Remove from playlist"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PlaylistDetails;

