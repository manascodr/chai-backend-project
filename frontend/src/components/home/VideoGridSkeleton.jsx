import React from "react";

export const VideoCardSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="w-full aspect-video rounded-2xl bg-[#121215] border border-white/5" />
    <div className="flex items-start gap-3 mt-1.5 px-0.5">
      <div className="w-9 h-9 rounded-full bg-[#18181d] shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-[#18181d] rounded-md w-11/12" />
        <div className="h-3 bg-[#18181d] rounded-md w-1/2" />
        <div className="h-2.5 bg-[#18181d] rounded-md w-1/3" />
      </div>
    </div>
  </div>
);

const VideoGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-5">
      {Array.from({ length: count }).map((_, idx) => (
        <VideoCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default VideoGridSkeleton;
