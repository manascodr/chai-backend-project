import { useEffect, useState } from "react";
import { getDashboardStats, getDashboardVideos } from "../api/dashboard.api";
import { toast } from "react-toastify";
import { togglePublishVideo } from "../api/video.api";
import { Link } from "react-router-dom";
import { FiFilm, FiEye, FiUsers, FiThumbsUp, FiUpload, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

/**
 * Dashboard (Creator Studio) Component
 * 
 * Provides creator analytics and video lifecycle management:
 * 1. KPI Metric cards: Total Views, Subscribers, Total Likes, Uploaded Videos.
 * 2. Real-time publish/unpublish toggle with loading feedback.
 * 3. Direct links to preview uploaded videos.
 */
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const formatNumber = (value) =>
    new Intl.NumberFormat(undefined, { notation: "compact" }).format(
      Number(value ?? 0),
    );

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    Promise.all([getDashboardStats(), getDashboardVideos()])
      .then(([statsRes, videosRes]) => {
        if (cancelled) return;

        setStats(statsRes.data.data);
        setVideos(videosRes.data.data || []);
      })
      .catch((err) => {
        if (cancelled) return;

        const message =
          err?.response?.data?.message || "Failed to load dashboard metrics";
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTogglePublish = async (videoId) => {
    if (togglingId) return;

    setTogglingId(videoId);

    try {
      const res = await togglePublishVideo(videoId);
      const updatedVideo = res.data.data;

      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId
            ? { ...v, isPublished: updatedVideo.isPublished }
            : v,
        ),
      );
      toast.success(
        updatedVideo.isPublished ? "Video published successfully" : "Video set to private/unpublished"
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update publish status",
      );
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <section className="dashboard">
        <div className="dashboard-stats">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dashboard-stat dashboard-stat--skeleton">
              <div className="skeleton-line" style={{ width: "40%", height: "14px" }} />
              <div className="skeleton-line" style={{ width: "60%", height: "28px", marginTop: "0.5rem" }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="state state--error">
        <p className="state__title">Failed to load Dashboard</p>
        <p className="state__text">{error}</p>
      </div>
    );
  }

  return (
    <section className="dashboard">
      {/* Header */}
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Creator Studio</h1>
          <p className="dashboard__subtitle">Track your performance and manage your video library.</p>
        </div>

        <div className="dashboard__headerActions">
          <Link to="/upload-video" className="btn btn-primary">
            <FiUpload /> Upload Video
          </Link>
        </div>
      </header>

      {/* KPI Metric Cards */}
      <section className="dashboard-stats" aria-label="Channel Statistics">
        <div className="dashboard-stat">
          <div className="dashboard-stat__iconWrap">
            <FiFilm />
          </div>
          <div className="dashboard-stat__body">
            <div className="dashboard-stat__label">Total Videos</div>
            <div className="dashboard-stat__value">{formatNumber(stats?.totalVideos)}</div>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat__iconWrap dashboard-stat__iconWrap--views">
            <FiEye />
          </div>
          <div className="dashboard-stat__body">
            <div className="dashboard-stat__label">Total Views</div>
            <div className="dashboard-stat__value">{formatNumber(stats?.totalViews)}</div>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat__iconWrap dashboard-stat__iconWrap--subs">
            <FiUsers />
          </div>
          <div className="dashboard-stat__body">
            <div className="dashboard-stat__label">Subscribers</div>
            <div className="dashboard-stat__value">{formatNumber(stats?.totalSubscribers)}</div>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat__iconWrap dashboard-stat__iconWrap--likes">
            <FiThumbsUp />
          </div>
          <div className="dashboard-stat__body">
            <div className="dashboard-stat__label">Total Likes</div>
            <div className="dashboard-stat__value">{formatNumber(stats?.totalLikes)}</div>
          </div>
        </div>
      </section>

      {/* Uploaded Videos Table/List */}
      <section className="dashboard-videos" aria-label="Your Uploaded Videos">
        <div className="dashboard-videos__header">
          <div className="dashboard-videos__headerLeft">
            <h2 className="dashboard-videos__title">Channel Videos</h2>
            <span className="dashboard-videos__count">({videos.length})</span>
          </div>
          <div className="dashboard-videos__hint">Toggle publish status to control video visibility</div>
        </div>

        {videos.length === 0 ? (
          <div className="dashboard-videos__empty">
            <FiFilm style={{ fontSize: "2rem", color: "var(--accent)", marginBottom: "0.5rem" }} />
            <p>No videos uploaded yet.</p>
            <Link to="/upload-video" className="btn btn-primary" style={{ marginTop: "0.75rem" }}>
              Upload your first video
            </Link>
          </div>
        ) : (
          <div className="dashboard-videos__list">
            {videos.map((v) => {
              const published = Boolean(v.isPublished);

              return (
                <article key={v._id} className="dashboard-video-row">
                  {/* Thumbnail */}
                  <Link to={`/watch/${v._id}`} className="dashboard-video-row__thumb">
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt={v.title} loading="lazy" />
                    ) : (
                      <div className="dashboard-video-row__thumbPlaceholder">
                        <FiFilm />
                      </div>
                    )}
                  </Link>

                  {/* Title & Metadata */}
                  <div className="dashboard-video-row__main">
                    <Link to={`/watch/${v._id}`} className="dashboard-video-row__title" title={v.title}>
                      {v.title}
                    </Link>

                    <div className="dashboard-video-row__meta">
                      <span className="dashboard-video-row__views">
                        <FiEye style={{ marginRight: "4px" }} /> {formatNumber(v.views)} views
                      </span>
                      <span
                        className={
                          published
                            ? "dashboard-badge dashboard-badge--published"
                            : "dashboard-badge dashboard-badge--unpublished"
                        }
                      >
                        {published ? (
                          <>
                            <FiCheckCircle /> Published
                          </>
                        ) : (
                          <>
                            <FiAlertCircle /> Private / Draft
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="dashboard-video-row__actions">
                    <button
                      type="button"
                      className={
                        published
                          ? "btn dashboard-btn--unpublish"
                          : "btn btn-primary dashboard-btn--publish"
                      }
                      onClick={() => handleTogglePublish(v._id)}
                      disabled={togglingId === v._id}
                    >
                      {togglingId === v._id
                        ? "Updating..."
                        : published
                          ? "Unpublish"
                          : "Publish Video"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
};

export default Dashboard;

