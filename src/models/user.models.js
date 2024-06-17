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


userSchema.pre("save",async function(next){     // Hashing the password before saving it to the database
    if(!this.isModified("password")) return next();     // in case the password is not modified
    try{
        const salt=await bcrypt.genSalt(10);
        this.password=await bcrypt.hash(this.password,salt);    // hashing the password
        return next();
    }catch(err){
        return next(err);
    }
});  

userSchema.methods.comparePassword=async function(password){    // Comparing the password
    return bcrypt.compare(password,this.password);   //this will return either true or false
};


userSchema.methods.geneateAccessToken=function(){   // Generating the access token before saving it  
 return jwt.sign({
    id:this._id,
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
        id:this._id,
       
        fullname:this.fullname,
    } ,process.env.ACCESS_TOKEN_SECRET,{  // secret key
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY,  // expiry time
    })
};


const User=mongoose.model("User",userSchema);
export {User};