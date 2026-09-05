import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideos } from "../api/video.api";
import VideoCard from "../components/video/VideoCard";
import { FiRefreshCw, FiFilm, FiX, FiCompass } from "react-icons/fi";

/**
 * Designer Category Filter Chips
 */
const CATEGORIES = [
  { id: "all", label: "All Works" },
  { id: "latest", label: "Recent", sort: "new" },
  { id: "popular", label: "Trending", sort: "views" },
  { id: "music", label: "Audio & Music", query: "music" },
  { id: "tech", label: "Technology", query: "tech" },
  { id: "podcasts", label: "Interviews & Talks", query: "podcast" },
  { id: "tutorials", label: "Masterclasses", query: "tutorial" },
  { id: "gaming", label: "Gaming", query: "gaming" },
];

/**
 * Skeleton Loader for Video Grid
 */
const VideoCardSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="w-full aspect-video rounded-2xl bg-[#111317] border border-white/[0.06]" />
    <div className="flex items-start gap-3 mt-1 px-0.5">
      <div className="w-8 h-8 rounded-full bg-[#181a20] shrink-0" />
      <div className="flex-1 flex flex-col gap-2 pt-0.5">
        <div className="h-3.5 bg-[#181a20] rounded-md w-11/12" />
        <div className="h-3 bg-[#181a20] rounded-md w-1/2" />
      </div>
    </div>
  </div>
);

/**
 * Home Feed Component
 * 
 * Editorial gallery presentation:
 * 1. Minimal frosted category chips.
 * 2. Spacious 3-column gallery grid (`max-w-7xl`).
 * 3. Search query status banner.
 * 4. Human-crafted empty and loading states.
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
      setError(err?.response?.data?.message || "Failed to load creations");
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
      {/* Category Filter Chips Bar */}
      <div className="sticky top-[64px] z-30 bg-[#090a0d]/90 backdrop-blur-2xl px-4 sm:px-6 py-2.5 border-b border-white/[0.07] mb-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-7xl mx-auto">
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
                className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-150 cursor-pointer tactile-btn ${
                  isActive
                    ? "bg-white text-zinc-950 font-medium shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-white/[0.07]"
                }`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Search Filter Status */}
      {q && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 mb-6">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl bg-[#111317] border border-white/[0.08]">
            <span className="text-xs sm:text-sm text-zinc-300">
              Showing results for <span className="text-white font-medium">“{q}”</span>
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors cursor-pointer"
              onClick={handleClearSearch}
              title="Reset query"
            >
              <FiX className="text-sm" /> Clear
            </button>
          </div>
        </div>
      )}

      {/* Video Content Grid */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16">
        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <VideoCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-[#111317] rounded-2xl border border-white/[0.08] max-w-lg mx-auto my-8">
            <p className="text-base font-semibold text-white mb-1">Unable to load creations</p>
            <p className="text-xs text-zinc-400 mb-5 max-w-sm">{error}</p>
            <button
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs shadow-xs transition-all cursor-pointer tactile-btn"
              onClick={() => loadPage(1)}
            >
              <FiRefreshCw className="text-xs" /> Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-[#111317] rounded-2xl border border-white/[0.08] max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 mb-3">
              <FiFilm className="text-xl" />
            </div>
            <p className="text-base font-semibold text-zinc-100 mb-1">No creations found</p>
            <p className="text-xs text-zinc-400 max-w-xs mb-5">
              {q
                ? `No videos match “${q}”. Try a different search term or browse all works.`
                : "No videos have been published yet. Be the first to share your work."}
            </p>
            {q ? (
              <button
                className="inline-flex items-center px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition-all cursor-pointer tactile-btn"
                onClick={handleClearSearch}
              >
                Clear Filter
              </button>
            ) : null}
          </div>
        )}

        {/* Video Cards Grid */}
        {!loading && !error && videos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="mt-14 flex justify-center items-center">
              {hasMore ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#111317] hover:bg-[#181a20] text-zinc-300 hover:text-zinc-100 font-medium text-xs border border-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer tactile-btn"
                  onClick={() => {
                    if (!loadingMore) loadPage(page + 1);
                  }}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }} />
                      <span>Loading...</span>
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              ) : (
                <p className="text-xs text-zinc-500 font-normal">All caught up</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Home;

















