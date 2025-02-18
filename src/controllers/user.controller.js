import {asyncHandler} from "../utils/asyncHandler.js";

import {ApiErrors} from "../utils/ApiErrors.js";

import { ApiResponse } from "../utils/ApiResponse.js";

import {User} from "../models/user.models.js";     // only the "User will talk to the database"

import {uploadOnCloudinary} from "../utils/cloudinary.js";

import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId);   // finding the user
       const accessToken= user.generateAccessToken();     
       const refreshToken= user.generateRefreshToken();

       user.refreshToken=refreshToken;   // saving the refresh token in the database
       await user.save({validateBeforeSave:false});   // saving the user..it will help us to save even if the password is not provided

       return {accessToken,refreshToken};   // returning the access and refresh token

    }
    catch(err){
        throw new ApiErrors(500,"Something went wrong while generating the tokens")
    }
}

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

   const existedUser=await User.findOne({$or:[{username},{email}]})   // checking if the user already exists

   if(existedUser){
       throw new ApiErrors(409,"User with same email or username already exists")  // if the user already exists
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;  // getting the avatar image from the front end...this will give us the path of the image
    

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {  // checking if the cover image has been uploaded or not
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){                                             // checking once again if the avatar has been uploaded or not
        throw new ApiErrors(405,"Please upload the avatar image")
    }

    const user=await User.create({       // creating a user
        fullname,
        avatar:avatar.url,
       email,
       coverImage:coverImage?.url || "",    // this ? will mean that we are not sure if we will have a url of coverimahe or not as it is not necesary ansyways and we also have not checked if the cover image has been uploaded or not
       username:username.toLowerCase(),    // converting the username to lowercase
       password,
    })

    const createdUser=await User.findById(user._id).select(   //   finding if the user has been created successfully or not
        "-password -refreshToken"    // removing the password and refresh token from the response
    )
    if(!createdUser){
        throw new ApiErrors(500,"Something went wrong while registering the user")

    }

    return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
    )

})





const loginUser=asyncHandler(async(req,res)=>{
// get the details from the user
//username and email 
//find the user
//password check
//access and refresh token generation
//send cookies
//return response

const{username,email,password}=req.body;
if(!username && !email){   // checking if the username and email are provided or not
    throw new ApiErrors(400,"Please provide username or email");
}

const user=await User.findOne({$or:[{username},{email}]})  // finding the user

if(!user){
    throw new ApiErrors(404,"User not found");
}

 const isPasswordValid=await user.comparePassword(password);  // comparing the password

 
if(!isPasswordValid){
    throw new ApiErrors(404,"Invalid password");
}
   
const {accessToken,refreshToken} =await generateAccessAndRefreshTokens(user._id)   // generating the access and refresh tokens


const loggedInUser=await User.findById(user._id).select("-password -refreshToken")   // finding the user and removing the password and refresh token from the response

const options={    // setting the options for the cookies
    httpOnly:true,
    secure:true,
}
return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(  // sending the cookies
    new ApiResponse(200,loggedInUser,"User logged in successfully")
)

})


const logoutUser=asyncHandler(async(req,res) =>{
    // clear the cookies
    // clear tokens
    //return response

    await User.findByIdAndUpdate(
        req.user._id,  // finding the user 
        {
            $set:{
                refreshToken:undefined
            }
          
        },
        {
            new:true,
            runValidators:true
        }
    
    )

    
const options={
    httpOnly:true,
    secure:true,
}
return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(   // clearing the cookies
    new ApiResponse(200,{},"User logged out successfully")
)

})



const refreshAccessToken=asyncHandler(async(req,res)=>{
const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken;



if(!incomingRefreshToken){
    throw new ApiErrors(401,"Unauthorized");
}

   
  try {
       
   const decodedToken=jwt.verify(incomingRefreshToken,process.env.ACCESS_TOKEN_SECRET)   // verifying the refresh token
    
    
     
    const user=await User.findById(decodedToken?._id)   // finding the user

   

      if(!user){
          throw new ApiErrors(401,"Invalid Refresh Token")
        
          
      }
      
     if(user.refreshToken!==incomingRefreshToken){
       
       
         throw new ApiErrors(401,"Invalid Refresh Token")
        
     }
    
    

   
      
     const options={
           httpOnly:true,
           secure:true,
     }

   
  
    const {accessToken,newrefreshToken}= await generateAccessAndRefreshTokens(user._id)   // generating the access and refresh tokens
    
     return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newrefreshToken,options).json(
         new ApiResponse(200,{},"Access Token Refreshed Successfully")
     )
  } catch (error) {
        throw new ApiErrors(401,"Unauthorized Access");
    
  }

})




const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword}=req.body;   // getting the old and new password from the front end

    const user=await User.findById(req.user?._id);   // finding the user....this comes form the middleware

     const isPasswordCorrect=user.isPasswordorrect(oldPassword);   // checking if the old password is valid or not

     if(!isPasswordCorrect){
         throw new ApiErrors(401,"Invalid Password");
     }
     user.password=newPassword;   // changing the password

     await user.save({validateBeforeSave:false});   // saving the user

        return res.status(200).json(
            new ApiResponse(200,{},"Password changed successfully")
        )
})


const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,req.user,"User details fetched successfully")   // req.body will have the user details
    )
})


const updateAccountDetails=asyncHandler(async(req,res)=>{
    const{email,username}=req.body;   // getting the user details from the front end

    if(!username && !email){   // checking if the fields are empty
        throw new ApiErrors(400,"Please fill in all the fields")
    }
    const user=await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                email:email || req.user.email,   // updating the email
                username:username || req.user.username,   // updating the username
            
            }

        
        }
        ,{new:true,runValidators:true}).select("-password")   // updating the user details
        return res.status(200).json(
            new ApiResponse(200,user,"User details updated successfully")
        )
});






const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath= req.file.path;   // getting the path of the avatar image
 
    if(!avatarLocalPath){   // checking if the avatar image is uploaded or not
        throw new ApiErrors(400,"cover image file is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)   
    if(!avatar.url){
          throw new ApiErrors(405,"Please upload the avatar image")
     
    }
 
    const user=await User.findByIdAndUpdate(req.user?._id,
     {
         $set:{
             avatar:avatar.url
         }
     },
     {
         new:true,
         runValidators:true
     }
     ).select("-password")
 
     return res.status(200).json(
         new ApiResponse(200,user,"Avatar updated successfully")
     )
    
 
 })
 


const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath= req.file.path;   // getting the path of the avatar image
 
    if(!coverImageLocalPath){   // checking if the avatar image is uploaded or not
        throw new ApiErrors(400,"cover image file is required")
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)   
    if(!coverImage.url){
          throw new ApiErrors(405,"Please upload the cover image")
     
    }
 
    const user=await User.findByIdAndUpdate(req.user?._id,
     {
         $set:{
             coverImage:coverImage.url
         }
     },
     {
         new:true,
         runValidators:true
     }
     ).select("-password")
 
     return res.status(200).json(
         new ApiResponse(200,user,"Cover image updated successfully")
     )
    
 
 })
 



export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage};