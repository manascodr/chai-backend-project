import { useEffect, useState } from "react";
import { getDashboardStats, getDashboardVideos } from "../api/dashboard.api";
import { toast } from "react-toastify";
import { togglePublishVideo } from "../api/video.api";
import { Link } from "react-router-dom";
import { FiFilm, FiEye, FiUsers, FiThumbsUp, FiUpload, FiCheckCircle, FiAlertCircle, FiTrendingUp } from "react-icons/fi";

/**
 * Dashboard (Creator Studio) Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Provides creator analytics and video lifecycle management:
 * 1. Metric cards: Total Views, Subscribers, Total Likes, Uploaded Videos with gold highlights.
 * 2. Real-time publish/unpublish toggle with loading feedback.
 * 3. Direct preview links to uploaded videos.
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
      <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-3xl bg-[#121215] border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-8 my-12 rounded-3xl bg-[#121215] border border-amber-500/20 text-center">
        <p className="text-lg font-bold text-amber-400 mb-1">Failed to load Dashboard</p>
        <p className="text-sm text-zinc-400 m-0">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">Creator Studio</h1>
          <p className="text-sm text-zinc-400 mt-1 m-0">Track channel metrics and manage your production library.</p>
        </div>

        <Link
          to="/upload-video"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all self-start sm:self-auto no-underline"
        >
          <FiUpload /> Upload Video
        </Link>
      </header>

      {/* KPI Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Channel Statistics">
        <div className="flex items-center gap-4 p-5 rounded-3xl bg-[#121215] border border-white/[0.08] hover:border-amber-500/30 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl shrink-0">
            <FiFilm />
          </div>
          <div>
            <div className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Total Videos</div>
            <div className="text-2xl font-black text-white mt-0.5">{formatNumber(stats?.totalVideos)}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-3xl bg-[#121215] border border-white/[0.08] hover:border-amber-500/30 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 text-2xl shrink-0">
            <FiEye />
          </div>
          <div>
            <div className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Total Views</div>
            <div className="text-2xl font-black text-white mt-0.5">{formatNumber(stats?.totalViews)}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-3xl bg-[#121215] border border-white/[0.08] hover:border-emerald-500/30 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl shrink-0">
            <FiUsers />
          </div>
          <div>
            <div className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Subscribers</div>
            <div className="text-2xl font-black text-white mt-0.5">{formatNumber(stats?.totalSubscribers)}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-3xl bg-[#121215] border border-white/[0.08] hover:border-rose-500/30 transition-all shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl shrink-0">
            <FiThumbsUp />
          </div>
          <div>
            <div className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Total Likes</div>
            <div className="text-2xl font-black text-white mt-0.5">{formatNumber(stats?.totalLikes)}</div>
          </div>
        </div>
      </section>

      {/* Uploaded Videos Table/List */}
      <section className="flex flex-col gap-4" aria-label="Your Uploaded Videos">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight m-0">Channel Library</h2>
            <span className="text-sm font-semibold text-zinc-500">({videos.length})</span>
          </div>
          <span className="text-xs text-zinc-500">Toggle publish status to control visibility</span>
        </div>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#121215] rounded-3xl border border-white/10 text-center px-4">
            <FiFilm className="text-4xl text-amber-400/60 mb-3 opacity-80" />
            <p className="text-sm text-zinc-400 mb-4 m-0">No videos uploaded yet.</p>
            <Link
              to="/upload-video"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md"
            >
              Upload your first video
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {videos.map((v) => {
              const published = Boolean(v.isPublished);

              return (
                <article
                  key={v._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#121215] border border-white/[0.08] hover:border-amber-500/30 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Thumbnail */}
                    <Link to={`/watch/${v._id}`} className="w-32 sm:w-40 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 block">
                      {v.thumbnail ? (
                        <img className="w-full h-full object-cover" src={v.thumbnail} alt={v.title} loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                          <FiFilm />
                        </div>
                      )}
                    </Link>

                    {/* Title & Metadata */}
                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                      <Link
                        to={`/watch/${v._id}`}
                        className="text-sm sm:text-base font-semibold text-white hover:text-amber-400 truncate no-underline transition-colors block"
                        title={v.title}
                      >
                        {v.title}
                      </Link>

                      <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <FiEye className="text-zinc-500" /> {formatNumber(v.views)} views
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            published
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {published ? (
                            <>
                              <FiCheckCircle className="text-xs" /> Published
                            </>
                          ) : (
                            <>
                              <FiAlertCircle className="text-xs" /> Private / Draft
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        published
                          ? "bg-[#18181d] hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 border border-white/10"
                          : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                      }`}
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
    </div>
  );
};

export default Dashboard;




