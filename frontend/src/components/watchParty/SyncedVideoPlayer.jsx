import React, { useEffect, useRef, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";

/**
 * SyncedVideoPlayer
 *
 * Implements HTML5 video sync with drift correction and programmatic event protection.
 */
const SyncedVideoPlayer = ({
  videoFile,
  thumbnail,
  title,
  remoteAction,
  initialPlayback,
  sendSyncAction,
  isHost,
}) => {
  const videoRef = useRef(null);
  const isRemoteUpdateRef = useRef(false);
  const [syncStatus, setSyncStatus] = useState("Synced");

  // 1. Initial room state alignment when entering
  useEffect(() => {
    if (!initialPlayback || !videoRef.current) return;
    const video = videoRef.current;

    isRemoteUpdateRef.current = true;
    if (initialPlayback.isPlaying) {
      // Calculate transit delay: current time + time elapsed since server update
      const elapsedSeconds = (Date.now() - initialPlayback.updatedAt) / 1000;
      video.currentTime = (initialPlayback.currentTime || 0) + Math.max(0, elapsedSeconds);
      video.play().catch(() => {
        // Autoplay policy might require user gesture
      });
    } else {
      video.currentTime = initialPlayback.currentTime || 0;
      video.pause();
    }

    setTimeout(() => {
      isRemoteUpdateRef.current = false;
    }, 150);
  }, [initialPlayback]);

  // 2. Handling incoming remote sync actions (PLAY / PAUSE / SEEK)
  useEffect(() => {
    if (!remoteAction || !videoRef.current) return;
    const video = videoRef.current;
    const { action, currentTime, serverTimestamp } = remoteAction;

    isRemoteUpdateRef.current = true;

    // Latency compensation
    const transitDelay = Math.max(0, (Date.now() - serverTimestamp) / 1000);
    const targetTime = action === "PLAY" ? currentTime + transitDelay : currentTime;

    const drift = Math.abs(video.currentTime - targetTime);

    if (action === "PLAY") {
      if (drift > 0.5) {
        video.currentTime = targetTime;
      }
      video.play().catch((err) => console.log("Play interrupted or blocked:", err));
      setSyncStatus("Playing in sync");
    } else if (action === "PAUSE") {
      video.currentTime = targetTime;
      video.pause();
      setSyncStatus("Paused");
    } else if (action === "SEEK") {
      video.currentTime = targetTime;
      setSyncStatus("Seeked");
    }

    setTimeout(() => {
      isRemoteUpdateRef.current = false;
    }, 200);
  }, [remoteAction]);

  // 3. User interaction handlers (Local -> Broadcast to room)
  const handlePlay = () => {
    if (isRemoteUpdateRef.current) return;
    if (videoRef.current) {
      sendSyncAction("PLAY", videoRef.current.currentTime);
    }
  };

  const handlePause = () => {
    if (isRemoteUpdateRef.current) return;
    if (videoRef.current) {
      sendSyncAction("PAUSE", videoRef.current.currentTime);
    }
  };

  const handleSeeked = () => {
    if (isRemoteUpdateRef.current) return;
    if (videoRef.current) {
      sendSyncAction("SEEK", videoRef.current.currentTime);
    }
  };

  if (!videoFile) return null;

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
      <video
        ref={videoRef}
        className="w-full h-full object-contain outline-none"
        controls
        playsInline
        preload="auto"
        poster={thumbnail}
        aria-label={title || "Synced Video Player"}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
      >
        <source src={videoFile} type="video/mp4" />
        <source src={videoFile} type="video/webm" />
        Your browser does not support HTML5 video.
      </video>

      {/* Real-time sync badge overlay */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white">
        <FaSyncAlt className="text-emerald-400 animate-spin" style={{ animationDuration: "4s" }} />
        <span>{syncStatus}</span>
      </div>
    </div>
  );
};

export default SyncedVideoPlayer;

