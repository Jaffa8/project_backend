import mongoose from 'mongoose';  

import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';  // for pagination

const videoSchema = new mongoose.Schema({
    videofile:{
        type:String,    // from cloudinary
        required:true,
    },
    thumbnail:{
        type:String,    // from cloudinary
        required:true,
    },
    title:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
        trim:true,
    },
    duration:{
        type:Number,    // cloudinary does give information about the video duration
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    



},{timestamps:true});

videoSchema.plugin(mongooseAggregatePaginate);   

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;