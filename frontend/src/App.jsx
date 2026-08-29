import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./api/auth.api";
import { useAuthStore } from "./stores/auth.store";
import Home from "./pages/Home";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import VideoDetails from "./pages/VideoDetails";
import ChannelPage from "./pages/ChannelPage";
import WatchHistory from "./pages/watchHistory";
import AppLayout from "./components/layout/AppLayout";
import LikedVideos from "./pages/LikedVideos";
import UploadVideo from "./pages/UploadVideo";
import Dashboard from './pages/Dashboard';
import ProfileSettings from "./pages/ProfileSettings";
import PlaylistsPage from "./pages/PlaylistsPage";
import PlaylistDetails from "./pages/PlaylistDetails";
import TweetsPage from "./pages/TweetsPage";
import TweetFeedPage from "./pages/TweetFeedPage";

/**
 * Main application router component.
 *
 * What’s happening here:
 * - On mount, it fetches the current authenticated user (`getCurrentUser`).
 * - If successful, it stores the user in auth state (`setUser(res.data.data)`).
 * - If it fails, it clears auth state by setting user to `null`.
 * - While the auth check is in progress, it renders a simple `Loading...` fallback.
 *
 * Routing behavior:
 * - Public auth routes:
 *   - `/login` and `/register` are only for logged-out users.
 *   - If already logged in, those paths redirect to `/`.
 * - Protected routes:
 *   - Wrapped with `ProtectedRoute` + `AppLayout`.
 *   - Paths like `/`, `/watch/:videoId`, `/history`, etc. require authentication.
 *   - Unauthenticated access is expected to redirect to `/login` via `ProtectedRoute`.
 * - Catch-all route:
 *   - Any unknown path redirects to `/`.
 *
 * @component
 * @returns {JSX.Element} The app routes, with auth-aware redirects and protected pages.
 */
const App = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [setUser]);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* Redirect logic:
      If user is logged in:
      /login → redirects to /
      */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />

      {/* Protected Layout 
      If user is logged out:
      Protected pages (/, /watch/..., /history) → redirect to /login
      */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/watch/:videoId" element={<VideoDetails />} />
        <Route path="/c/:username" element={<ChannelPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/playlist/:playlistId" element={<PlaylistDetails />} />
        <Route path="/tweets/feed" element={<TweetFeedPage />} />
        <Route path="/tweets" element={<TweetsPage />} />
        <Route path="/history" element={<WatchHistory />} />
        <Route path="/liked-videos" element={<LikedVideos />} />
        <Route path="/upload-video" element={<UploadVideo />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        
      </Route>

      {/* Fallback if user enters random stuff in the url */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
