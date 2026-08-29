import React from "react";

/**
 * VideoPlayer Component (Tailwind Edition)
 * 
 * Renders a responsive 16:9 HTML5 video player with modern browser controls.
 */
const VideoPlayer = ({ videoFile, thumbnail, title }) => {
  if (!videoFile) return null;

  return (
    <div className="relative w-full aspect-video bg-black flex items-center justify-center">
      <video
        className="w-full h-full object-contain rounded-2xl outline-none"
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


