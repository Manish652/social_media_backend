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
    // For nested replies: reference to parent comment
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    // Array of reply comment IDs
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    // Number of likes on a comment
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
},{timestamps:true});

const CommentModel = mongoose.model("Comment",commentSchema);
export default CommentModel;

