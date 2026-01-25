import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { createPlaylist, getMyPlaylists } from "../api/playlist.api";

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
      await loadPlaylists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="playlists">
      <div className="playlists__container">
        <header className="playlists__header">
          <div className="playlists__heading">
            <h1 className="playlists__title">Playlists</h1>
            <p className="playlists__subtitle">Create and manage your playlists.</p>
          </div>
        </header>

        <section className="playlists__create" aria-label="Create playlist">
          <h2 className="playlists__sectionTitle">Create playlist</h2>

          <form className="playlists__createForm" onSubmit={onCreate}>
            <label className="playlists__label" htmlFor="playlistName">
              Playlist name
            </label>

            <div className="playlists__controls">
              <input
                id="playlistName"
                className="playlists__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Playlist name"
                disabled={creating}
              />
              <button
                className="playlists__button"
                type="submit"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </section>

        <section className="playlists__library" aria-label="Your playlists">
          <div className="playlists__libraryHeader">
            <h2 className="playlists__sectionTitle">Your playlists</h2>
          </div>

          {loading && <p className="playlists__state">Loading playlists...</p>}
          {error && !loading && <p className="playlists__state">{error}</p>}

          {!loading && !error && (
            <ul className="playlists__list">
              {playlists.length === 0 ? (
                <li className="playlists__empty">No playlists yet.</li>
              ) : (
                playlists.map((pl) => (
                  <li key={pl._id} className="playlist-item">
                    <Link
                      to={`/playlist/${pl._id}`}
                      className="playlist-item__link"
                    >
                      <span className="playlist-item__name">{pl.name}</span>
                      <span className="playlist-item__meta">
                        {(pl.videos?.length || 0).toString()} videos
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
};

export default PlaylistsPage;
