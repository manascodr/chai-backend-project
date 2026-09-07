import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { createPlaylist, getMyPlaylists } from "../api/playlist.api";
import { useAuthStore } from "../stores/auth.store";
import { FiFolder, FiPlus, FiFilm, FiFolderPlus, FiLogIn } from "react-icons/fi";

/**
 * PlaylistsPage Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Central collection page for user playlists:
 * 1. Quick create form with amber input and gold button.
 * 2. Visual card grid for each playlist showing video count and navigation link.
 */
const PlaylistsPage = () => {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const loadPlaylists = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
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
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
        <header className="pb-4 border-b border-white/[0.07]">
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight m-0">Your Playlists</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 m-0">Organize and curate custom collections of creations.</p>
        </header>

        <div className="flex flex-col items-center justify-center py-20 bg-[#111317] rounded-3xl border border-white/[0.08] text-center px-4 max-w-md mx-auto my-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-4 border border-amber-500/20">
            <FiFolder />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Keep collections organized</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mb-6 max-w-xs leading-relaxed">
            Playlists are saved to registered accounts. Sign in to curate and view your video collections.
          </p>
          <Link
            to="/login"
            state={{ from: "/playlists" }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all no-underline tactile-btn"
          >
            <FiLogIn className="text-base stroke-[2.5]" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

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
      <section className="bg-[#111317] border border-white/[0.07] rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white text-lg shrink-0">
            <FiFolderPlus />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight m-0">New Collection</h2>
            <p className="text-xs text-zinc-400 m-0">Group creations into custom curated playlists.</p>
          </div>
        </div>

        <form className="w-full" onSubmit={onCreate}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="playlistName"
              className="flex-1 bg-[#090a0d] text-white px-4 py-2.5 rounded-xl border border-white/[0.08] focus:border-white/30 focus:ring-1 focus:ring-white/10 text-sm outline-none transition-all placeholder-zinc-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Masterclass Series, Electronic Audio, Architecture..."
              disabled={creating}
            />
            <button
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0 tactile-btn"
              type="submit"
              disabled={creating || !name.trim()}
            >
              {creating ? "Creating..." : <><FiPlus /> Create Collection</>}
            </button>
          </div>
        </form>
      </section>

      {/* Playlists Grid */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white tracking-tight m-0">Your Collections</h2>
          <span className="text-xs text-zinc-500 tabular-nums">({playlists.length})</span>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        )}

        {error && !loading && (
          <div className="p-5 rounded-2xl bg-[#111317] border border-white/[0.08] text-center">
            <p className="text-sm font-semibold text-white mb-1">Error loading collections</p>
            <p className="text-xs text-zinc-400 m-0">{error}</p>
          </div>
        )}

        {!loading && !error && playlists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-[#111317] rounded-2xl border border-white/[0.08] text-center px-4">
            <FiFolder className="text-3xl text-zinc-500 mb-3 opacity-80" />
            <p className="text-base font-semibold text-zinc-200 mb-1">No collections created yet</p>
            <p className="text-xs text-zinc-500 m-0">Create your first playlist above to start curating creations.</p>
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
                  className="group flex flex-col p-5 rounded-2xl bg-[#111317] hover:bg-[#16181f] border border-white/[0.07] hover:border-white/[0.18] shadow-xs transition-all no-underline"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] group-hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-zinc-300 group-hover:text-white text-xl transition-all">
                      <FiFolder />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.04] text-zinc-300 border border-white/[0.08] tabular-nums">
                      <FiFilm className="text-zinc-400" /> {videoCount}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors truncate m-0 mb-1" title={pl.name}>
                    {pl.name}
                  </h3>
                  <span className="text-xs text-zinc-500">
                    {videoCount} {videoCount === 1 ? "creation" : "creations"}
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




