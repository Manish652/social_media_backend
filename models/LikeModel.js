import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({

    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
},{timestamps:true});

const LikeModel = mongoose.model("Like",likeSchema);

export default LikeModel;
