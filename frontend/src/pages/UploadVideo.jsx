import { useState } from "react";
import { useForm } from "react-hook-form";
import { uploadVideo } from "../api/video.api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud, FiImage, FiVideo, FiCheckCircle, FiInfo } from "react-icons/fi";

/**
 * UploadVideo Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Provides video creator upload pipeline:
 * 1. File input dropzones for Video file & Thumbnail.
 * 2. Title and multi-line Description form controls.
 * 3. Loading animation and direct redirect to watch page upon success.
 */
const UploadVideo = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const [uploading, setUploading] = useState(false);

  const selectedVideoFile = watch("videoFile");
  const selectedThumbnail = watch("thumbnail");

  const submitHandler = async (data) => {
    if (uploading) return;
    setUploading(true);

    const video = data.videoFile[0];
    const thumbnail = data.thumbnail[0];

    // Video validation
    if (!["video/mp4", "video/webm"].includes(video.type)) {
      toast.error("Only MP4 or WebM videos are allowed");
      setUploading(false);
      return;
    }

    // Video size check (100MB limit)
    if (video.size > 100 * 1024 * 1024) {
      toast.error("Video must be under 100MB");
      setUploading(false);
      return;
    }

    // Thumbnail validation
    if (!["image/jpeg", "image/png", "image/webp"].includes(thumbnail.type)) {
      toast.error("Thumbnail must be JPG, PNG, or WebP");
      setUploading(false);
      return;
    }

    // Thumbnail size check (5MB limit)
    if (thumbnail.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail must be under 5MB");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title.trim());
    formData.append("description", data.description.trim());
    formData.append("videoFile", video);
    formData.append("thumbnail", thumbnail);

    try {
      const res = await uploadVideo(formData);
      toast.success("Video uploaded and published successfully!");
      reset();

      const videoId = res?.data?.data?._id;
      if (videoId) navigate(`/watch/${videoId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      <header className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">Upload New Video</h1>
        <p className="text-sm text-zinc-400 mt-1 m-0">Publish your media to VividStream for your audience to discover.</p>
      </header>

      <div className="bg-[#121215] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-xs sm:text-sm text-zinc-300">
          <FiInfo className="text-lg shrink-0 text-amber-400" />
          <span>Supported: MP4 / WebM (up to 100MB). Thumbnails: JPG, PNG, WebP (up to 5MB).</span>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit(submitHandler)}>
          {/* Title field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="title">
              Video Title <span className="text-amber-400">*</span>
            </label>
            <input
              id="title"
              className="w-full bg-[#09090b] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all placeholder-zinc-500"
              placeholder="e.g. Building a Modern Web App with React & Node.js"
              {...register("title", {
                required: "Title is required",
                minLength: { value: 3, message: "Title must be at least 3 characters" },
              })}
              disabled={uploading}
            />
            {errors.title && <span className="text-xs text-rose-400">{errors.title.message}</span>}
          </div>

          {/* Description field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="description">
              Description <span className="text-amber-400">*</span>
            </label>
            <textarea
              id="description"
              className="w-full bg-[#09090b] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all placeholder-zinc-500 resize-none"
              placeholder="Tell viewers about your video, topics covered, and helpful links..."
              rows={4}
              {...register("description", {
                required: "Description is required",
                minLength: { value: 10, message: "Description must be at least 10 characters" },
              })}
              disabled={uploading}
            />
            {errors.description && (
              <span className="text-xs text-rose-400">{errors.description.message}</span>
            )}
          </div>

          {/* File Upload Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Video File Dropzone */}
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="videoFile">
                Video File <span className="text-amber-400">*</span>
              </label>
              <div className="relative border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all bg-[#09090b] hover:bg-[#141418]">
                <FiVideo className="text-3xl text-amber-400 mb-2" />
                <input
                  id="videoFile"
                  type="file"
                  accept="video/mp4,video/webm"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  {...register("videoFile", { required: "Video file is required" })}
                  disabled={uploading}
                />
                <div className="text-xs text-zinc-300 pointer-events-none">
                  {selectedVideoFile?.[0] ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 justify-center">
                      <FiCheckCircle /> {selectedVideoFile[0].name}
                    </span>
                  ) : (
                    <span>Choose MP4 or WebM file</span>
                  )}
                </div>
              </div>
              {errors.videoFile && (
                <span className="text-xs text-rose-400">{errors.videoFile.message}</span>
              )}
            </div>

            {/* Thumbnail File Dropzone */}
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="thumbnail">
                Cover Thumbnail <span className="text-amber-400">*</span>
              </label>
              <div className="relative border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all bg-[#09090b] hover:bg-[#141418]">
                <FiImage className="text-3xl text-amber-400 mb-2" />
                <input
                  id="thumbnail"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  {...register("thumbnail", { required: "Thumbnail is required" })}
                  disabled={uploading}
                />
                <div className="text-xs text-zinc-300 pointer-events-none">
                  {selectedThumbnail?.[0] ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 justify-center">
                      <FiCheckCircle /> {selectedThumbnail[0].name}
                    </span>
                  ) : (
                    <span>Choose 16:9 image file</span>
                  )}
                </div>
              </div>
              {errors.thumbnail && (
                <span className="text-xs text-rose-400">{errors.thumbnail.message}</span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/[0.08] flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  <span>Encoding & Uploading...</span>
                </>
              ) : (
                <>
                  <FiUploadCloud className="text-lg" /> Publish Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;
