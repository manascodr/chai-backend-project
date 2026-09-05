import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideos } from "../api/video.api";

const PAGE_LIMIT = 12;

export const useHomeVideos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const q = useMemo(() => (searchParams.get("q") || "").trim(), [searchParams]);
  const sort = useMemo(() => searchParams.get("sort") || "new", [searchParams]);
  const sortBy = sort === "views" ? "views" : "createdAt";
  const sortType = "desc";

  const loadPage = useCallback(
    async (nextPage) => {
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
          limit: PAGE_LIMIT,
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
          setHasMore(nextVideos.length >= PAGE_LIMIT);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load videos");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [q, sortBy, sortType]
  );

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const selectCategory = (category) => {
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

  const clearSearch = () => {
    setActiveCategory("all");
    setSearchParams(new URLSearchParams());
  };

  const loadNextPage = () => {
    if (!loadingMore && hasMore) {
      loadPage(page + 1);
    }
  };

  const reload = () => loadPage(1);

  return {
    videos,
    loading,
    loadingMore,
    error,
    hasMore,
    query: q,
    sort,
    activeCategory,
    selectCategory,
    clearSearch,
    loadNextPage,
    reload,
  };
};
