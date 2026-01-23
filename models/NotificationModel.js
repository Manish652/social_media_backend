import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type:{
        type: String,
        enum: ["like","comment","follow","post"],
        default: "like"
    },
    fromUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: false,
        default: null
    },
    read:{
        type: Boolean,
        default: false
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

const NotificationModel = mongoose.model("Notification",notificationSchema);
export default NotificationModel;
