import { Router } from "express";

import {upload} from "../middlewares/multer.middleware.js";   // as we want to upload the image to cloudinary

import {registerUser,loginUser,logoutUser} from "../controllers/user.controller.js";   // importing the register and login user functions from the user controller

import {verifyJWT} from "../middlewares/auth.middleware.js";   // importing the verifyJWT function from the auth middleware 

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

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT,logoutUser)   // we are using the verifyJWT middleware to verify the JWT token before logging out the user

export default router;