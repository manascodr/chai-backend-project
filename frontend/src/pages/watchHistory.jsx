import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getUserHistory } from "../api/user.api";

const WatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    getUserHistory()
      .then((res) => setHistory(res?.data?.data ?? []))
      .catch((err) => setError(err?.message || "Failed to load watch history"))
      .finally(() => setLoading(false));
  }, []);

  const formatCompactNumber = (value) => {
    const n = Number(value) || 0;
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  const formatDuration = (seconds) => {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const timeAgo = (dateLike) => {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "";
    const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    const minutes = Math.floor(diffSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years === 1 ? "" : "s"} ago`;
    if (months > 0) return `${months} month${months === 1 ? "" : "s"} ago`;
    if (weeks > 0) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    return "Just now";
  };

  const visibleHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = Array.isArray(history) ? [...history] : [];

    if (q) {
      items = items.filter((video) => {
        const title = (video?.title || "").toLowerCase();
        const ownerName = (video?.owner?.fullname || video?.owner?.username || "").toLowerCase();
        return title.includes(q) || ownerName.includes(q);
      });
    }

    if (sortBy === "title") {
      items.sort((a, b) => (a?.title || "").localeCompare(b?.title || ""));
    } else if (sortBy === "channel") {
      items.sort((a, b) => {
        const aName = a?.owner?.fullname || a?.owner?.username || "";
        const bName = b?.owner?.fullname || b?.owner?.username || "";
        return aName.localeCompare(bName);
      });
    } else {
      // "recent" - keep API order (assumed most-recent-first)
    }

    return items;
  }, [history, query, sortBy]);

  return (
    <div className="watch-history">
      <header className="watch-history__header">
        <div className="watch-history__title">
          <h1>Watch history</h1>
          <p>Find videos you watched recently.</p>
        </div>

        <div className="watch-history__controls">
          <div className="watch-history__search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search watch history"
              aria-label="Search watch history"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="watch-history__clear">
                Clear
              </button>
            ) : null}
          </div>

          <select
            className="watch-history__sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort watch history"
          >
            <option value="recent">Most recent</option>
            <option value="title">Title</option>
            <option value="channel">Channel</option>
          </select>
        </div>
      </header>

      {error ? <div className="watch-history__error">{error}</div> : null}

      {loading ? (
        <div className="watch-history__loading">
          <div className="watch-history__skeleton" />
          <div className="watch-history__skeleton" />
          <div className="watch-history__skeleton" />
          <div className="watch-history__skeleton" />
        </div>
      ) : visibleHistory.length ? (
        <div className="watch-history__list" role="list">
          {visibleHistory.map((video) => {
            const ownerName = video?.owner?.fullname || video?.owner?.username || "Unknown channel";
            const ownerAvatar = video?.owner?.avatar || "";
            const created = timeAgo(video?.createdAt);
            const views = formatCompactNumber(video?.views);
            const duration = formatDuration(video?.duration);

            return (
              <Link
                key={video?._id}
                to={`/watch/${video?._id}`}
                className="history-item"
                role="listitem"
              >
                <div className="history-item__thumb">
                  <img src={video?.thumbnail} alt={video?.title || "Video thumbnail"} loading="lazy" />
                  {duration ? <span className="history-item__duration">{duration}</span> : null}
                </div>

                <div className="history-item__body">
                  <div className="history-item__title" title={video?.title}>
                    {video?.title || "Untitled"}
                  </div>

                  <div className="history-item__meta">
                    <div className="history-item__channel">
                      {ownerAvatar ? (
                        <img className="history-item__avatar" src={ownerAvatar} alt={ownerName} loading="lazy" />
                      ) : (
                        <div className="history-item__avatar history-item__avatar--placeholder" aria-hidden="true" />
                      )}
                      <span className="history-item__channel-name">{ownerName}</span>
                    </div>
                    <span className="history-item__dot">•</span>
                    <span className="history-item__stat">{views} views</span>
                    {created ? (
                      <>
                        <span className="history-item__dot">•</span>
                        <span className="history-item__stat">{created}</span>
                      </>
                    ) : null}
                  </div>

                  {video?.description ? (
                    <div className="history-item__desc">{video.description}</div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="watch-history__empty">
          <h2>No watch history yet</h2>
          <p>Watch a few videos and they’ll show up here.</p>
          <Link className="watch-history__cta" to="/">
            Browse videos
          </Link>
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
