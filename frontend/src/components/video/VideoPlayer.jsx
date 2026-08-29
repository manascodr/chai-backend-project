import React from "react";

/**
 * VideoPlayer Component
 * 
 * Renders a responsive 16:9 HTML5 video player with modern browser controls,
 * smooth buffering feedback, and seamless aspect ratio preservation across devices.
 */
const VideoPlayer = ({ videoFile, thumbnail, title }) => {
  if (!videoFile) return null;

  return (
    <div className="video-player-container">
      <video
        className="video-player-element"
        controls
        playsInline
        preload="metadata"
        poster={thumbnail}
        aria-label={title || "Video Player"}
      >
        <source src={videoFile} type="video/mp4" />
        <source src={videoFile} type="video/webm" />
        Your browser does not support HTML5 video playback.
      </video>
    </div>
  );
};

export default VideoPlayer;

