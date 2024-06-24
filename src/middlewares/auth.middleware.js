import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiErrors } from "../utils/ApiErrors.js";

import jwt from "jsonwebtoken";

import { User } from "../models/user.models.js";

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken ||   req.header("Authorization")?.replace("Bearer ","") 
    
        if(!token){
            throw new ApiErrors(401,"Unauthorized")
        }
        // verify the token
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
       const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
       if(!user){
           throw new ApiErrors(401,"Invalid Access Token")
       }
       req.user=user;
       next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            // Handle invalid token errors
            throw new ApiErrors(401, "Invalid token");
        } else if (error.name === 'TokenExpiredError') {
            // Handle expired token errors
            throw new ApiErrors(401, "Token has expired");
        } else {
            // For other errors, consider logging them for debugging purposes
            console.error("Error in verifyJWT middleware:", error);
            throw new ApiErrors(500, "An internal server error occurred");
        }

    
}
})