import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    caption:{
        type: String,
        trim: true
    },
    image:{
        type: String,
        trim: true
    },
    video:{
        type: String,
        trim: true
    },
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    tags: [
        {
            type: String,
            trim: true
        }
    ],
    

},{timestamps:true});

const PostModel = mongoose.model("Post",postSchema);
export default PostModel;
