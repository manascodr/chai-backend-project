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

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("videoFile", data.videoFile[0]);
    formData.append("thumbnail", data.thumbnail[0]);

    try {
      const res = await uploadVideo(formData);
      toast.success("Video uploaded successfully!");

      const videoId = res?.data?.data?._id;
      reset();

      if (videoId) {
        navigate(`/watch/${videoId}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Video upload failed");
    } finally {
      setUploading(false);
    }
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
