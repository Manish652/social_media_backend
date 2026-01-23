import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    text:{
        type: String,
        trim: true
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

const CommentModel = mongoose.model("Comment",commentSchema);

export default CommentModel;

