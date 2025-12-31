import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// import  dotenv from "dotenv";
// dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getCloudinaryPublicIdFromUrl = (urlString) => {
  try {
    if (!urlString || typeof urlString !== "string") return null;
    const url = new URL(urlString);

    // Typical pattern:
    // /<resource_type>/upload/<transformations?>/v<version>/<public_id>.<ext>
    const [_, afterUpload] = url.pathname.split("/upload/");
    if (!afterUpload) return null;

    const segments = afterUpload.split("/").filter(Boolean);
    const versionIndex = segments.findIndex((s) => /^v\d+$/.test(s));
    const publicIdSegments =
      versionIndex >= 0 ? segments.slice(versionIndex + 1) : segments;
    if (publicIdSegments.length === 0) return null;

    const withExt = publicIdSegments.join("/");
    const withoutExt = withExt.replace(/\.[^/.]+$/, "");
    return decodeURIComponent(withoutExt);
  } catch {
    return null;
  }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
  } catch {
    return null;
  }
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // to support any kind of file format
    });
    // file has been uploaded successfully
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

export {
  uploadOnCloudinary,
  deleteFromCloudinary,
  getCloudinaryPublicIdFromUrl,
};
