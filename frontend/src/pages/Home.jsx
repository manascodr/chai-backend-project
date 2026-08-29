import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideos } from "../api/video.api";
import VideoCard from "../components/video/VideoCard";
import { FiRefreshCw, FiFilm, FiX } from "react-icons/fi";

/**
 * YouTube-style Category Filter Chips
 */
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "latest", label: "✨ Latest", sort: "new" },
  { id: "popular", label: "🔥 Most Viewed", sort: "views" },
  { id: "music", label: "Music", query: "music" },
  { id: "gaming", label: "Gaming", query: "gaming" },
  { id: "tech", label: "Tech & Coding", query: "tech" },
  { id: "podcasts", label: "Podcasts", query: "podcast" },
  { id: "tutorials", label: "Tutorials", query: "tutorial" },
];

/**
 * Skeleton Loader for YouTube Video Grid
 */
const VideoCardSkeleton = () => (
  <div className="video-card-skeleton">
    <div className="skeleton-thumb" />
    <div className="skeleton-details">
      <div className="skeleton-avatar" />
      <div className="skeleton-lines">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--channel" />
        <div className="skeleton-line skeleton-line--meta" />
      </div>
    </div>
  </div>
);

/**
 * Home Feed Component (YouTube Experience)
 * 
 * Provides an authentic YouTube-style video discovery portal:
 * 1. Sticky horizontal category chips bar with fast sorting & topic exploration.
 * 2. Responsive 16:9 thumbnail grid with fluid auto-filling columns.
 * 3. Clear search filter banner with 1-click dismissal.
 * 4. Pagination / Load more controls.
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
    <section className="home-youtube">
      {/* Horizontal Category Chips Bar (YouTube style) */}
      <div className="home-youtube__chipsContainer">
        <div className="home-youtube__chipsBar">
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
                className={`home-youtube__chip ${
                  isActive ? "home-youtube__chip--active" : ""
                }`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Search Banner */}
      {q && (
        <div className="home-youtube__searchBanner">
          <span className="home-youtube__searchText">
            Results for <strong>“{q}”</strong>
          </span>
          <button
            type="button"
            className="home-youtube__clearBtn"
            onClick={handleClearSearch}
            title="Clear filter"
          >
            <FiX /> Clear filter
          </button>
        </div>
      )}

      {/* Video Content Grid */}
      <div className="home-youtube__feed">
        {/* Loading Skeletons */}
        {loading && (
          <div className="video-grid">
            {Array.from({ length: 8 }).map((_, idx) => (
              <VideoCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state state--error">
            <p className="state__title">Unable to load feed</p>
            <p className="state__text">{error}</p>
            <div className="state__actions">
              <button className="btn btn-primary" onClick={() => loadPage(1)}>
                <FiRefreshCw /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && videos.length === 0 && (
          <div className="state state--empty">
            <FiFilm style={{ fontSize: "2.5rem", color: "var(--accent)", marginBottom: "0.5rem" }} />
            <p className="state__title">No videos found</p>
            <p className="state__text">
              {q
                ? `We couldn’t find any matches for “${q}”. Try a different keyword.`
                : "No videos have been uploaded yet. Be the first creator to upload!"}
            </p>
            {q ? (
              <div className="state__actions">
                <button className="btn btn-primary" onClick={handleClearSearch}>
                  View all videos
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Video Cards Grid */}
        {!loading && !error && videos.length > 0 && (
          <>
            <div className="video-grid">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="home-youtube__footer">
              {hasMore ? (
                <button
                  type="button"
                  className="btn home-youtube__loadMoreBtn"
                  onClick={() => {
                    if (!loadingMore) loadPage(page + 1);
                  }}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <div
                        className="spinner"
                        style={{ width: "16px", height: "16px", borderWidth: "2px" }}
                      />
                      Loading more videos...
                    </>
                  ) : (
                    "Load more videos"
                  )}
                </button>
              ) : (
                <p className="home-youtube__caughtUp">You're all caught up! ✨</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Home;


