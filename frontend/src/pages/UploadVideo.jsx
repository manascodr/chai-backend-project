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
    <section className="upload-video">
      <h1>Upload Video</h1>

      <form onSubmit={handleSubmit(submitHandler)}>
        <input
          placeholder="Title"
          {...register("title", {
            required: "Title is required",
            minLength: { value: 3, message: "Title too short" },
          })}
        />
        {errors.title && <span>{errors.title.message}</span>}

        <textarea
          placeholder="Description"
          {...register("description", {
            required: "Description is required",
            minLength: { value: 10, message: "Description too short" },
          })}
        />
        {errors.description && <span>{errors.description.message}</span>}

        <label>
          Video file
          <input
            type="file"
            accept="video/*"
            {...register("videoFile", { required: "Video is required" })}
          />
        </label>
        {errors.videoFile && <span>{errors.videoFile.message}</span>}

        <label>
          Thumbnail
          <input
            type="file"
            accept="image/*"
            {...register("thumbnail", { required: "Thumbnail is required" })}
          />
        </label>
        {errors.thumbnail && <span>{errors.thumbnail.message}</span>}

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </section>
  );
};

export default UploadVideo;
