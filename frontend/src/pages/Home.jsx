import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideos } from "../api/video.api";
import VideoCard from "../components/video/VideoCard";
import { FiRefreshCw, FiFilm, FiX, FiCompass } from "react-icons/fi";

/**
 * Designer Category Filter Chips
 */
const CATEGORIES = [
  { id: "all", label: "All Creations" },
  { id: "latest", label: "✨ New Releases", sort: "new" },
  { id: "popular", label: "🔥 Top Trending", sort: "views" },
  { id: "music", label: "Music & Audio", query: "music" },
  { id: "gaming", label: "Gaming & Streams", query: "gaming" },
  { id: "tech", label: "Tech & Dev", query: "tech" },
  { id: "podcasts", label: "Podcasts & Talks", query: "podcast" },
  { id: "tutorials", label: "Tutorials & Masterclasses", query: "tutorial" },
];

/**
 * Skeleton Loader for Video Grid
 */
const VideoCardSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="w-full aspect-video rounded-2xl bg-[#121215] border border-white/5" />
    <div className="flex items-start gap-3 mt-1.5 px-0.5">
      <div className="w-9 h-9 rounded-full bg-[#18181d] shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-[#18181d] rounded-md w-11/12" />
        <div className="h-3 bg-[#18181d] rounded-md w-1/2" />
        <div className="h-2.5 bg-[#18181d] rounded-md w-1/3" />
      </div>
    </div>
  </div>
);

/**
 * Home Feed Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Designer studio video discovery portal:
 * 1. Sticky frosted obsidian category chips bar with sunset amber highlights.
 * 2. Responsive 16:9 thumbnail grid with exactly 3 videos per row maximum (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
 * 3. Search query banner with 1-click dismissal.
 * 4. Pagination / Load more.
 */
const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const limit = 12;

  const q = useMemo(() => (searchParams.get("q") || "").trim(), [searchParams]);
  const sort = useMemo(() => searchParams.get("sort") || "new", [searchParams]);

  const sortBy = sort === "views" ? "views" : "createdAt";
  const sortType = "desc";

  const loadPage = async (nextPage) => {
    const isFirstPage = nextPage === 1;
    if (isFirstPage) {
      setLoading(true);
      setVideos([]);
    } else {
      setLoadingMore(true);
    }

    setError("");

    try {
      const res = await getAllVideos({
        page: nextPage,
        limit,
        query: q || undefined,
        sortBy,
        sortType,
      });
      const payload = res?.data?.data || {};
      const nextVideos = payload?.videos || [];

      setVideos((prev) => (isFirstPage ? nextVideos : [...prev, ...nextVideos]));
      setPage(Number(payload?.page || nextPage));

      const totalPages = Number(payload?.totalPages || 0);
      if (totalPages) {
        setHasMore(nextPage < totalPages);
      } else {
        setHasMore(nextVideos.length >= limit);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sortBy, sortType]);

  const handleCategorySelect = (category) => {
    setActiveCategory(category.id);
    const next = new URLSearchParams();

    if (category.sort) {
      next.set("sort", category.sort);
    }
    if (category.query) {
      next.set("q", category.query);
    }

    setSearchParams(next);
  };

  const handleClearSearch = () => {
    setActiveCategory("all");
    setSearchParams(new URLSearchParams());
  };

  return (
    <section className="w-full flex flex-col min-h-full">
      {/* Horizontal Category Chips Bar (Sticky Frosted Obsidian) */}
      <div className="sticky top-[64px] z-30 bg-[#09090b]/90 backdrop-blur-2xl px-4 sm:px-6 py-3 border-b border-white/[0.08] mb-6">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-0.5">
          {CATEGORIES.map((cat) => {
            const isActive =
              (cat.id === "all" && !q && sort === "new" && activeCategory === "all") ||
              (cat.sort && sort === cat.sort && !q) ||
              (cat.query && q.toLowerCase() === cat.query.toLowerCase()) ||
              activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-sm shadow-amber-500/30 font-bold"
                    : "bg-[#141418] text-zinc-300 hover:text-white hover:bg-[#1c1c22] border border-white/10 hover:border-white/20"
                }`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Search Filter Banner */}
      {q && (
        <div className="flex items-center justify-between gap-4 mx-4 sm:mx-6 mb-6 px-4 py-3 rounded-2xl bg-[#121215] border border-amber-500/20 shadow-sm">
          <span className="text-sm text-zinc-300">
            Filtered results for <strong className="text-amber-400">“{q}”</strong>
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-zinc-900 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 border border-white/10 transition-colors cursor-pointer"
            onClick={handleClearSearch}
            title="Clear filter"
          >
            <FiX /> Clear filter
          </button>
        </div>
      )}

      {/* Video Content Grid (Strictly 3 videos per row maximum) */}
      <div className="px-4 sm:px-6 pb-12">
        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <VideoCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-[#121215] rounded-3xl border border-amber-500/20 max-w-xl mx-auto my-8">
            <p className="text-lg font-bold text-amber-400 mb-1">Unable to load feed</p>
            <p className="text-sm text-zinc-400 mb-6">{error}</p>
            <button
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
              onClick={() => loadPage(1)}
            >
              <FiRefreshCw /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4 bg-[#121215] rounded-3xl border border-white/10 max-w-lg mx-auto my-8">
            <FiFilm className="text-5xl text-amber-400/60 mb-4" />
            <p className="text-lg font-bold text-zinc-100 mb-1">No videos found</p>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              {q
                ? `We couldn’t find any matches for “${q}”. Try a different keyword.`
                : "No videos have been uploaded yet. Be the first creator to publish!"}
            </p>
            {q ? (
              <button
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
                onClick={handleClearSearch}
              >
                View all creations
              </button>
            ) : null}
          </div>
        )}

        {/* Video Cards Grid (Strictly 3 videos per row maximum) */}
        {!loading && !error && videos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-5">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="mt-12 flex justify-center items-center">
              {hasMore ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#141418] hover:bg-[#1c1c22] text-zinc-200 hover:text-white font-semibold text-sm border border-white/10 hover:border-amber-500/40 shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    if (!loadingMore) loadPage(page + 1);
                  }}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    "Load more creations"
                  )}
                </button>
              ) : (
                <p className="text-xs text-zinc-500 font-medium">You're all caught up ✨</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Home;





