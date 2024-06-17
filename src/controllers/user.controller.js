import {asyncHandler} from "../utils/asyncHandler.js";

import {ApiErrors} from "../utils/ApiErrors.js";

import { ApiResponse } from "../utils/ApiResponse.js";

import {User} from "../models/user.models.js";     // only the "User will talk to the database"

import {uploadOnCloudinary} from "../utils/cloudinary.js";

const registerUser=asyncHandler(async(req,res)=>{
   // get user deteails
   // validation-not empty
   //check if user already exists--- check both through email and username
   // check for images and avatar
   //upload them to cloudinary,avatar
   // create user object--create entry in db
   // remove password and refresh token filed from response
   // check for user creation
   //return response


   const{username,fullname,email,password}=req.body   // getting the user details from the front end
   if(username==="" || fullname==="" || email==="" || password===""){   // checking if the fields are empty
       throw new ApiErrors(400,"Please fill in all the fields")
   }

   const existedUser=User.findOne({$or:[{username},{email}]})   // checking if the user already exists

   if(existedUser){
       throw new ApiErrors(409,"User with same email or username already exists")  // if the user already exists
   }

   const avatarLocalPath=req.files?.avatar[0]?.path;   // getting the path of the avatar image
    const coverImageLocalPath= req.files?.coverImage[0]?.path;   // getting the path of the cover image...though it is not of any use to us

    if(!avatarLocalPath){                                         // check in the models that we have defined avatar as required
        throw new ApiErrors(400,"Please upload an avatar image")  // if the avatar image is not uploaded
    }

   const avatar= await uploadOnCloudinary(avatarLocalPath)       // upload on cloudinary
   const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){                                             // checking once again if the avatar has been uploaded or not
        throw new ApiErrors(400,"Please upload an avatar image")
    }

    const user=await User.create({       // creating a user
        fullname,
        avatar:avatar.url,
       email,
     coverImage:coverImage?.url || "",    // this ? will mean that we are not sure if we will have a url of coverimahe or not as it is not necesary ansyways and we also have not checked if the cover image has been uploaded or not
     username:username.toLowerCase(),
     password,
    })

    const createdUser=await User.findbyId(user._id).select(   //   finding if the user has been created successfully or not
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiErrors(500,"Somethibg went wrong while registering the user")

    }

    return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
    )

})



export {registerUser};