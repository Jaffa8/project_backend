import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiErrors } from "../utils/ApiErrors.js";

import jwt from "jsonwebtoken";

import { User } from "../models/user.models.js";

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        
        const token=req.cookies?.accessToken  ||   req.header("Authorization")?.replace("Bearer ","") 
         console.log(token);
        if(!token){
            throw new ApiErrors(401,"Unauthorized")
        }
        
        // verify the token
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
         
       console.log("decoded token",decodedToken);

       const user=await User.findById(decodedToken?.id).select("-password -refreshToken")

       console.log("user",user);
       
       if(!user){
           throw new ApiErrors(401,"Invalid Access Token")
       }
      
       req.user=user;   
      
       next();
    }
     catch (error) {
        throw new ApiErrors(401,"Unauthorized");
        
    
}
})