import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

    chat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required:true
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{
        type:String,
        required:true
    },
    media:{
        type:String,
        default:null
    },
    seen:{
        type:Boolean,
        default:false
    },
},{timestamps:true});

const MessageModel = mongoose.model("Message",messageSchema);

export default MessageModel;
