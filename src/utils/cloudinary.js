import {v2 as cloudinary} from 'cloudinary';
import { log } from 'console';
import fs from 'fs';


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
})


const uploadOnCloudinary= async (localFilePath)=>{
    try{
        if(!localFilePath) return null;
        // upload the file to cloudinary
        const response= await cloudinary.uploader.upload(localFilePath,{
            resourse_type:'auto',
        });
        // file uploaded successfully
        console.log("File uploaded successfully. Cloudinary URL:", response.url);
        return response
    }catch(error){
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as upload failed
        console.log("Error uploading file to Cloudinary:", error);
        return null;
    }
}

export {uploadOnCloudinary};
