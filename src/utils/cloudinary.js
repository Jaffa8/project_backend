import {v2 as cloudinary} from 'cloudinary';

import fs from 'fs';  // File system module



    
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
        api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
    });


    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if(!localFilePath) throw new Error('Local file path is required');
            // Upload file on cloudinary
            const result = await cloudinary.uploader.upload(localFilePath);
            resource_type: 'auto'
            // file uploaded successfully
            console.log('File uploaded successfully',result.url);
            return result;
        }
        catch (error) {
            fs.unlinkSync(localFilePath); // remove file from local directory
            console.log('Error while uploading file on cloudinary',error.message);
            return null;
        }
    }
        

    export default uploadOnCloudinary;