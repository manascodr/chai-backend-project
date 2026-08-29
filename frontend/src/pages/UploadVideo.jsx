import { useState } from "react";
import { useForm } from "react-hook-form";
import { uploadVideo } from "../api/video.api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud, FiImage, FiVideo, FiCheckCircle, FiInfo } from "react-icons/fi";

/**
 * UploadVideo Component
 * 
 * Provides a streamlined video publish workflow:
 * 1. Title & description inputs with validation.
 * 2. Visual file selection zones for MP4/WebM videos and JPG/PNG thumbnails.
 * 3. File size and format pre-validation with clear feedback.
 * 4. Automatic redirect to newly uploaded video on completion.
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
    <section className="page page--upload upload">
      <header className="page__header">
        <div>
          <h1 className="page__title">Upload New Video</h1>
          <p className="page__subtitle">Publish your media to VividStream for your audience to discover.</p>
        </div>
      </header>

      <div className="page__content upload__panel">
        <div className="upload__guidelines">
          <FiInfo className="upload__infoIcon" />
          <span>Supported: MP4 / WebM (up to 100MB). Thumbnails: JPG, PNG, WebP (up to 5MB).</span>
        </div>

        <form className="form upload__form" onSubmit={handleSubmit(submitHandler)}>
          {/* Title field */}
          <div className="field">
            <label className="field__label" htmlFor="title">
              Video Title *
            </label>
            <input
              id="title"
              className="input"
              placeholder="e.g. Building a Modern Web App with React & Node.js"
              {...register("title", {
                required: "Title is required",
                minLength: { value: 3, message: "Title must be at least 3 characters" },
              })}
              disabled={uploading}
            />
            {errors.title && <span className="field__error">{errors.title.message}</span>}
          </div>

          {/* Description field */}
          <div className="field">
            <label className="field__label" htmlFor="description">
              Description *
            </label>
            <textarea
              id="description"
              className="textarea"
              placeholder="Tell viewers about your video, topics covered, and helpful links..."
              rows={4}
              {...register("description", {
                required: "Description is required",
                minLength: { value: 10, message: "Description must be at least 10 characters" },
              })}
              disabled={uploading}
            />
            {errors.description && (
              <span className="field__error">{errors.description.message}</span>
            )}
          </div>

          {/* File Upload Grid */}
          <div className="field__grid">
            {/* Video File Dropzone */}
            <div className="field">
              <label className="field__label" htmlFor="videoFile">
                Video File *
              </label>
              <div className="upload__dropzone">
                <FiVideo className="upload__dropzoneIcon" />
                <input
                  id="videoFile"
                  type="file"
                  accept="video/mp4,video/webm"
                  className="upload__fileInput"
                  {...register("videoFile", { required: "Video file is required" })}
                  disabled={uploading}
                />
                <div className="upload__dropzoneText">
                  {selectedVideoFile?.[0] ? (
                    <span className="upload__selectedName">
                      <FiCheckCircle /> {selectedVideoFile[0].name}
                    </span>
                  ) : (
                    <span>Choose MP4 or WebM file</span>
                  )}
                </div>
              </div>
              {errors.videoFile && (
                <span className="field__error">{errors.videoFile.message}</span>
              )}
            </div>

            {/* Thumbnail File Dropzone */}
            <div className="field">
              <label className="field__label" htmlFor="thumbnail">
                Cover Thumbnail *
              </label>
              <div className="upload__dropzone">
                <FiImage className="upload__dropzoneIcon" />
                <input
                  id="thumbnail"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="upload__fileInput"
                  {...register("thumbnail", { required: "Thumbnail is required" })}
                  disabled={uploading}
                />
                <div className="upload__dropzoneText">
                  {selectedThumbnail?.[0] ? (
                    <span className="upload__selectedName">
                      <FiCheckCircle /> {selectedThumbnail[0].name}
                    </span>
                  ) : (
                    <span>Choose 16:9 image file</span>
                  )}
                </div>
              </div>
              {errors.thumbnail && (
                <span className="field__error">{errors.thumbnail.message}</span>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="upload__actions">
            <button type="submit" className="btn btn-primary upload__submitBtn" disabled={uploading}>
              {uploading ? (
                <>
                  <div className="spinner" style={{ width: "18px", height: "18px" }} />
                  Uploading & Processing Video...
                </>
              ) : (
                <>
                  <FiUploadCloud /> Publish Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default UploadVideo;

