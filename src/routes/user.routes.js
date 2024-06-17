import { Router } from "express";

import {upload} from "../middlewares/multer.middleware.js";   // as we want to upload the image to cloudinary

import { registerUser } from "../controllers/user.controller.js";

const router=Router();

router.route("/register").post             
( upload.fields (                      // upload.fields is used to upload multiple files
    [
        {                                           
            name: "avatar", maxCount: 1            // maxCount is used to specify the maximum number of files that can be uploaded
        },  
        {
             name: "coverImage", maxCount: 1
        }
    ]
),
registerUser
);    

export default router;