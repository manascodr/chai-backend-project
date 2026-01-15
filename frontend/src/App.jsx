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
import AppLayout from "./components/layout/AppLayout";

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
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected Layout */}
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
        <Route path="/history" element={<WatchHistory />} />
      </Route>
    </Routes>
  );
};

export default App;
