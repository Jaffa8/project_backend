import mongoose from "mongoose";

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

const userSchema=new mongoose.Schema({
  username:{
    type:String,
    required:true,
    lowercase:true,
    unique:true,
    trim:true,          // Trimming the whitespaces
    index:true,        // Indexing the username field for faster query
  },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String,     // cloudinary image url
        required:true,
    },
    coverImage:{
        type:String,     // cloudinary image url
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"],
    },
    refreshToken:{
        type:String,
    },

},{timestamps:true});


userSchema.pre("save",async function(next){     // .pre(save) is a middleware that runs before saving the user
    if(!this.isModified("password")) return next();     // in case the password is not modified
    try{
        const salt=await bcrypt.genSalt(10);
        this.password=await bcrypt.hash(this.password,salt);    // hashing the password
        return next();
    }catch(err){
        return next(err);
    }
});  

userSchema.methofs.isPasswordCorrect=async function(password){   // checking if the password is correct
    return await bcrypt.compare(password,this.password);
}


userSchema.methods.generateAccessToken=function(){   // Generating the access token before saving it  
 return jwt.sign({
    _id:this._id,
    username:this.username,   // payload
    email:this.email,
    fullname:this.fullname,
} ,process.env.ACCESS_TOKEN_SECRET,{  // secret key
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY,  // expiry time
}
)
}

userSchema.methods.generateRefreshToken=function(){    // Generating the refresh token
    return jwt.sign({
        _id:this._id,
       
        fullname:this.fullname,
    } ,process.env.ACCESS_TOKEN_SECRET,{  // secret key
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY,  // expiry time
    })
};


const User=mongoose.model("User",userSchema);
export {User};