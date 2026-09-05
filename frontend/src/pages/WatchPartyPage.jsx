import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVideoById } from "../api/video.api";
import { useAuthStore } from "../stores/auth.store";
import { useWatchParty } from "../hooks/useWatchParty";
import SyncedVideoPlayer from "../components/watchParty/SyncedVideoPlayer";
import WatchPartySidebar from "../components/watchParty/WatchPartySidebar";
import { FaArrowLeft } from "react-icons/fa";

const WatchPartyPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);

  // Extract videoId from roomId format: roomId can be "party_<videoId>_<timestamp>" or similar, or query/state
  // Or extract from initial room sync. Let us also support roomId passed with video info.
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    isConnected,
    messages,
    users,
    hostId,
    remoteAction,
    initialPlayback,
    sendSyncAction,
    sendMessage,
    isHost,
  } = useWatchParty({
    roomId,
    videoId: videoData?._id,
    currentUser,
  });

  // Fetch video details once roomId or video is identified
  useEffect(() => {
    // If roomId contains the videoId (e.g., party_<videoId>_hash or just videoId passed)
    // Or fetch through videoId in query/route
    const urlParams = new URLSearchParams(window.location.search);
    const queryVideoId = urlParams.get("v");
    const targetVideoId = queryVideoId || (roomId?.includes("_") ? roomId.split("_")[1] : roomId);

    if (!targetVideoId) {
      setError("No video associated with this watch party.");
      setLoading(false);
      return;
    }

    getVideoById(targetVideoId)
      .then((res) => {
        // Backend returns { video, isLiked, isSubscribed, subscriberCount, likesCount } inside res.data.data
        const fetchedVideo = res.data?.data?.video || res.data?.data;
        setVideoData(fetchedVideo);
      })
      .catch((err) => {
        console.error("Failed to load video:", err);
        setError("Failed to load video for watch party.");
      })
      .finally(() => setLoading(false));
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-bold text-white mb-2">Watch Party Not Found</h2>
        <p className="text-zinc-400 text-sm mb-6">{error || "Could not find video details."}</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm transition-all"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back button and status header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(`/watch/${videoData._id}`)}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <FaArrowLeft />
          <span>Exit Watch Party</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-500" : "bg-rose-500 animate-ping"
            }`}
          />
          <span className="text-xs text-zinc-400">
            {isConnected ? "Connected to Server" : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Main Grid: Video Player + Chat Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <SyncedVideoPlayer
            videoFile={videoData.videoFile}
            thumbnail={videoData.thumbnail}
            title={videoData.title}
            remoteAction={remoteAction}
            initialPlayback={initialPlayback}
            sendSyncAction={sendSyncAction}
            isHost={isHost}
          />

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
            <h1 className="text-lg font-bold text-white mb-1.5">{videoData.title}</h1>
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
              {videoData.description}
            </p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <WatchPartySidebar
            messages={messages}
            users={users}
            sendMessage={sendMessage}
            hostId={hostId}
            currentUser={currentUser}
            roomId={roomId}
          />
        </div>
      </div>
    </div>
  );
};

export default WatchPartyPage;

