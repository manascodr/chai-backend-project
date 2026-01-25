import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getPlaylistById, removeFromPlaylist } from "../api/playlist.api";
import VideoCard from "../components/video/VideoCard";

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
      await loadPlaylist();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove video");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="playlist-details">
      <div className="playlist-details__container">
        {loading && <p className="playlist-details__state">Loading...</p>}
        {!loading && error && <p className="playlist-details__state">{error}</p>}
        {!loading && !error && !playlist && (
          <p className="playlist-details__state">Playlist not found</p>
        )}

        {!loading && !error && playlist && (
          <>
            <header className="playlist-details__header">
              <div className="playlist-details__heading">
                <h1 className="playlist-details__title">{playlist.name}</h1>
                <p className="playlist-details__subtext">
                  {(playlist.videos?.length || 0).toString()} videos
                </p>
              </div>
            </header>

            {(playlist.videos || []).length === 0 ? (
              <p className="playlist-details__empty">No videos in this playlist.</p>
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
                          className="playlist-details__remove"
                          onClick={() => onRemove(v._id)}
                          disabled={removingId === v._id}
                        >
                          {removingId === v._id ? "Removing..." : "Remove"}
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
