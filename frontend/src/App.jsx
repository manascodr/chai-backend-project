import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./api/auth.api";
import { useAuthStore } from "./stores/auth.store";
import Home from "./pages/Home";

import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import VideoDetails from "./pages/VideoDetails";
import ChannelPage from "./pages/ChannelPage";
import WatchHistory from "./pages/watchHistory";

const App = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
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
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />} // replace to prevent going back to login after redirect
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/c/:username"
        element={
          <ProtectedRoute>
            <ChannelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/watch-history"
        element={
          <ProtectedRoute>
            <WatchHistory />
          </ProtectedRoute>
        }
      />

      <Route path="/watch/:videoId" element={<VideoDetails />} />
    </Routes>
  );
};

export default App;
