import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { createPlaylist, getMyPlaylists } from "../api/playlist.api";
import { FiFolder, FiPlus, FiFilm, FiFolderPlus } from "react-icons/fi";

/**
 * PlaylistsPage Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Central collection page for user playlists:
 * 1. Quick create form with amber input and gold button.
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
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <header className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">Collections & Playlists</h1>
        <p className="text-sm text-zinc-400 mt-1 m-0">Curate and organize your favorite videos into bespoke collections.</p>
      </header>

      {/* Create Playlist Form Card */}
      <section className="bg-[#121215] border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col gap-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl shrink-0">
            <FiFolderPlus />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight m-0">New Collection</h2>
            <p className="text-xs text-zinc-400 m-0">Group creations into custom curated playlists.</p>
          </div>
        </div>

        <form className="w-full" onSubmit={onCreate}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="playlistName"
              className="flex-1 bg-[#09090b] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all placeholder-zinc-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Masterclass Series, Electronic Audio, Tech Insights..."
              disabled={creating}
            />
            <button
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer shrink-0"
              type="submit"
              disabled={creating || !name.trim()}
            >
              {creating ? "Creating..." : <><FiPlus /> Create Collection</>}
            </button>
          </div>
        </form>
      </section>

      {/* Playlists Grid (3 columns max) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white tracking-tight m-0">Your Playlists</h2>
          <span className="text-sm font-semibold text-zinc-500">({playlists.length})</span>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        )}

        {error && !loading && (
          <div className="p-6 rounded-2xl bg-[#121215] border border-amber-500/20 text-center">
            <p className="text-base font-bold text-amber-400 mb-1">Error loading playlists</p>
            <p className="text-sm text-zinc-400 m-0">{error}</p>
          </div>
        )}

        {!loading && !error && playlists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-[#121215] rounded-3xl border border-white/10 text-center px-4">
            <FiFolder className="text-4xl text-amber-400/60 mb-3 opacity-80" />
            <p className="text-base font-bold text-zinc-200 mb-1">No collections created yet</p>
            <p className="text-xs text-zinc-500 m-0">Create your first playlist above to start curating videos.</p>
          </div>
        )}

        {!loading && !error && playlists.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {playlists.map((pl) => {
              const videoCount = pl.videos?.length || 0;

              return (
                <Link
                  key={pl._id}
                  to={`/playlist/${pl._id}`}
                  className="group flex flex-col p-5 rounded-3xl bg-[#121215] hover:bg-[#18181d] border border-white/[0.08] hover:border-amber-500/30 shadow-sm transition-all no-underline"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 group-hover:bg-amber-500/15 border border-white/10 group-hover:border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl transition-all">
                      <FiFolder />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-900 text-zinc-300 border border-white/10 group-hover:border-amber-500/30 group-hover:text-amber-400 transition-colors">
                      <FiFilm className="text-amber-400" /> {videoCount}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate m-0 mb-1" title={pl.name}>
                    {pl.name}
                  </h3>
                  <span className="text-xs text-zinc-400">
                    {videoCount} {videoCount === 1 ? "video" : "videos"} • Open playlist
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default PlaylistsPage;




