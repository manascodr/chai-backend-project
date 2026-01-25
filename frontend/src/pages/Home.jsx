import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideos } from "../api/video.api";
import VideoCard from "../components/video/VideoCard";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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

  const filteredVideos = videos;

  return (
    <section className="page page--home home">
      <header className="page__header">
        <div>
          <h1 className="page__title">Home</h1>
          <p className="page__subtitle">
            {q ? `Results for “${q}”` : "Latest videos"}
          </p>
        </div>

        <div className="page__actions">
          <label className="home__sort">
            <span className="home__sortLabel">Sort</span>
            <select
              value={sort}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                next.set("sort", e.target.value);
                setSearchParams(next);
              }}
            >
              <option value="new">Newest</option>
              <option value="views">Most viewed</option>
            </select>
          </label>

          {q ? (
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("q");
                setSearchParams(next);
              }}
            >
              Clear
            </button>
          ) : null}
        </div>
      </header>

      <div className="page__content home__feed">
        {loading && (
          <div className="state">
            <p className="state__title">Loading</p>
            <p className="state__text">Fetching videos…</p>
          </div>
        )}

        {!loading && error && (
          <div className="state state--error">
            <p className="state__title">Couldn’t load videos</p>
            <p className="state__text">{error}</p>
          </div>
        )}

        {!loading && !error && filteredVideos.length === 0 && (
          <div className="state state--empty">
            <p className="state__title">No videos</p>
            <p className="state__text">Nothing to show yet.</p>
          </div>
        )}

        {!loading && !error && filteredVideos.length > 0 && (
          <>
            <div className="video-grid">
              {filteredVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>

            <div className="home__footer">
              {hasMore ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!loadingMore) loadPage(page + 1);
                  }}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              ) : (
                <p className="muted">You’re all caught up.</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Home;
