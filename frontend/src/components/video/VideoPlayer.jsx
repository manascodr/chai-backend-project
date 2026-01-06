import React from "react";

const VideoPlayer = ({ videoFile }) => {
  return (
    <>
        <video width="600" controls>
          <source src={videoFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
    </>
  );
};

export default VideoPlayer;
