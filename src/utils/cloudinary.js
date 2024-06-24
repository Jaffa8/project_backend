import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';  // File system module

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Normalize the file path and convert backslashes to forward slashes
        const normalizedFilePath = path.normalize(localFilePath).replace(/\\/g, '/');

        // Check if the file exists
        if (!fs.existsSync(normalizedFilePath)) {
            throw new Error(`File not found at path: ${normalizedFilePath}`);
        }

        // console.log("normalizedFilePath", normalizedFilePath);

        const response = await cloudinary.uploader.upload(normalizedFilePath, {   // this method is provided by cloudinary to upload the file
            resource_type: "auto"
        });

        // File has been uploaded successfully
        console.log("File is uploaded on Cloudinary:",  response.url);
          fs.unlinkSync(normalizedFilePath);                         // Delete the file from the local system
        return response;
    } catch (error) {
        console.log("Error in uploading file on Cloudinary:", JSON.stringify(error)); 
        throw error;  // Re-throw the error after logging
    }
}

export { uploadOnCloudinary }
