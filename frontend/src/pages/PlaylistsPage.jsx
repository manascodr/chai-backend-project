import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { createPlaylist, getMyPlaylists } from "../api/playlist.api";
import { FiFolder, FiPlus, FiFilm, FiFolderPlus } from "react-icons/fi";

/**
 * PlaylistsPage Component
 * 
 * Central collection page for user playlists:
 * 1. Quick create form with input field and submit button.
 * 2. Visual card grid for each playlist showing video count and navigation link.
 */
const PlaylistsPage = () => {
  const [name, setName] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const loadPlaylists = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getMyPlaylists();
      setPlaylists(res?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (creating) return;

    const trimmed = name.trim();
    if (!trimmed) return;

    setCreating(true);
    try {
      await createPlaylist(trimmed);
      setName("");
      toast.success(`Playlist "${trimmed}" created!`);
      await loadPlaylists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="page playlists">
      <div className="playlists__container">
        {/* Header */}
        <header className="page__header">
          <div>
            <h1 className="page__title">Playlists</h1>
            <p className="page__subtitle">Organize and curate your favorite video collections.</p>
          </div>
        </header>

        {/* Create Playlist Form Card */}
        <section className="playlists__createCard" aria-label="Create new playlist">
          <div className="playlists__createHeader">
            <FiFolderPlus className="playlists__createIcon" />
            <div>
              <h2 className="playlists__sectionTitle">New Playlist</h2>
              <p className="playlists__createHint">Group videos into custom collections.</p>
            </div>
          </div>

          <form className="playlists__createForm" onSubmit={onCreate}>
            <div className="playlists__controls">
              <input
                id="playlistName"
                className="input playlists__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Web Development Tutorials, Workout Music..."
                disabled={creating}
              />
              <button
                className="btn btn-primary playlists__createBtn"
                type="submit"
                disabled={creating || !name.trim()}
              >
                {creating ? "Creating..." : <><FiPlus /> Create Playlist</>}
              </button>
            </div>
          </form>
        </section>

        {/* Playlists Grid */}
        <section className="playlists__library" aria-label="Your playlists">
          <div className="playlists__libraryHeader">
            <h2 className="playlists__sectionTitle">Your Collections ({playlists.length})</h2>
          </div>

          {loading && (
            <div className="playlists__loading">
              <div className="spinner" />
            </div>
          )}

          {error && !loading && (
            <div className="state state--error">
              <p className="state__title">Error loading playlists</p>
              <p className="state__text">{error}</p>
            </div>
          )}

          {!loading && !error && playlists.length === 0 && (
            <div className="state state--empty">
              <FiFolder style={{ fontSize: "2.5rem", color: "var(--accent)", marginBottom: "0.5rem" }} />
              <p className="state__title">No playlists created yet</p>
              <p className="state__text">Create your first playlist above to start organizing videos.</p>
            </div>
          )}

          {!loading && !error && playlists.length > 0 && (
            <div className="playlists__grid">
              {playlists.map((pl) => {
                const videoCount = pl.videos?.length || 0;

                return (
                  <Link key={pl._id} to={`/playlist/${pl._id}`} className="playlist-card">
                    <div className="playlist-card__iconWrap">
                      <FiFolder className="playlist-card__icon" />
                      <span className="playlist-card__badge">
                        <FiFilm /> {videoCount}
                      </span>
                    </div>

                    <div className="playlist-card__info">
                      <h3 className="playlist-card__name" title={pl.name}>{pl.name}</h3>
                      <span className="playlist-card__meta">
                        {videoCount} {videoCount === 1 ? "video" : "videos"} • View playlist
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default PlaylistsPage;

