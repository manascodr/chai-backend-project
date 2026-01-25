import { useEffect, useState } from "react";
import { getDashboardStats, getDashboardVideos } from "../api/dashboard.api";
import { toast } from "react-toastify";
import { togglePublishVideo } from "../api/video.api";

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
          err?.response?.data?.message || "Failed to load dashboard";
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
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update publish status",
      );
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <p className="dashboard__state">Loading dashboard...</p>;
  if (error) return <p className="dashboard__state">{error}</p>;

  return (
    <section className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Manage your videos and publishing.</p>
        </div>

        <div className="dashboard__meta">
          <span>{videos.length} videos</span>
        </div>
      </header>

      <section className="dashboard-stats">
        <div className="dashboard-stat">
          <div className="dashboard-stat__label">Total videos</div>
          <div className="dashboard-stat__value">{formatNumber(stats?.totalVideos)}</div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat__label">Total views</div>
          <div className="dashboard-stat__value">{formatNumber(stats?.totalViews)}</div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat__label">Subscribers</div>
          <div className="dashboard-stat__value">
            {formatNumber(stats?.totalSubscribers)}
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat__label">Total likes</div>
          <div className="dashboard-stat__value">{formatNumber(stats?.totalLikes)}</div>
        </div>
      </section>

      <section className="dashboard-videos">
        <div className="dashboard-videos__header">
          <h2 className="dashboard-videos__title">Your videos</h2>
          <div className="dashboard-videos__hint">Toggle publish status</div>
        </div>

        {videos.length === 0 ? (
          <div className="dashboard-videos__empty">No videos uploaded yet.</div>
        ) : (
          <div className="dashboard-videos__list">
            {videos.map((v) => {
              const published = Boolean(v.isPublished);

              return (
                <div key={v._id} className="dashboard-video-row">
                  <div className="dashboard-video-row__thumb">
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt={v.title} loading="lazy" />
                    ) : (
                      <div className="dashboard-video-row__thumbPlaceholder" />
                    )}
                  </div>

                  <div className="dashboard-video-row__main">
                    <div className="dashboard-video-row__title" title={v.title}>
                      {v.title}
                    </div>

                    <div className="dashboard-video-row__meta">
                      <span className="dashboard-video-row__views">
                        {formatNumber(v.views)} views
                      </span>
                      <span
                        className={
                          published
                            ? "dashboard-badge dashboard-badge--published"
                            : "dashboard-badge dashboard-badge--unpublished"
                        }
                      >
                        {published ? "Published" : "Unpublished"}
                      </span>
                    </div>
                  </div>

                  <div className="dashboard-video-row__actions">
                    <button
                      className={
                        published
                          ? "dashboard-btn dashboard-btn--unpublish"
                          : "dashboard-btn dashboard-btn--publish"
                      }
                      onClick={() => handleTogglePublish(v._id)}
                      disabled={togglingId === v._id}
                    >
                      {togglingId === v._id
                        ? "Updating..."
                        : published
                          ? "Unpublish"
                          : "Publish"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
};

export default Dashboard;
