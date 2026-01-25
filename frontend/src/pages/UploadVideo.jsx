import { useState } from "react";
import { useForm } from "react-hook-form";
import { uploadVideo } from "../api/video.api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UploadVideo = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [uploading, setUploading] = useState(false);

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

    // Video size check
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

    // Thumbnail size check
    if (thumbnail.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail must be under 5MB");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("videoFile", video);
    formData.append("thumbnail", thumbnail);

    try {
      const res = await uploadVideo(formData);
      toast.success("Video uploaded successfully!");
      reset();

      const videoId = res?.data?.data?._id;
      if (videoId) navigate(`/watch/${videoId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
    reset();
  };

  return (
    <section className="page page--upload upload">
      <header className="page__header">
        <div>
          <h1 className="page__title">Upload video</h1>
          <p className="page__subtitle">Publish a new video to your channel.</p>
        </div>
      </header>

      <div className="page__content upload__panel">
        <p className="upload__note">
          Supported: MP4/WebM up to 100MB. Thumbnails: JPG/PNG/WebP up to 5MB.
        </p>

        <form className="form upload__form" onSubmit={handleSubmit(submitHandler)}>
          <div className="field">
            <label className="field__label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="input"
              placeholder="A clear, searchable title"
              {...register("title", {
                required: "Title is required",
                minLength: { value: 3, message: "Title too short" },
              })}
              disabled={uploading}
            />
            {errors.title && <span className="field__error">{errors.title.message}</span>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="textarea"
              placeholder="What is this video about?"
              {...register("description", {
                required: "Description is required",
                minLength: { value: 10, message: "Description too short" },
              })}
              disabled={uploading}
            />
            {errors.description && (
              <span className="field__error">{errors.description.message}</span>
            )}
          </div>

          <div className="field__grid">
            <div className="field">
              <label className="field__label" htmlFor="videoFile">
                Video file
              </label>
              <input
                id="videoFile"
                type="file"
                accept="video/*"
                {...register("videoFile", { required: "Video is required" })}
                disabled={uploading}
              />
              {errors.videoFile && (
                <span className="field__error">{errors.videoFile.message}</span>
              )}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="thumbnail">
                Thumbnail
              </label>
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                {...register("thumbnail", { required: "Thumbnail is required" })}
                disabled={uploading}
              />
              {errors.thumbnail && (
                <span className="field__error">{errors.thumbnail.message}</span>
              )}
            </div>
          </div>

          <div className="upload__actions">
            <button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default UploadVideo;
