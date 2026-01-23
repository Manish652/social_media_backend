import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default:""
    },
    bio:{
        type:String,
        default:""
    },
    followers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    following:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]

},{timestamps:true});

const UserModel = mongoose.model("User",userSchema);

export default UserModel;

