import UserModel from "../models/UserModel.js";
import PostModel from "../models/PostModel.js";

export const searchAll = async(req,res)=>{
    try {
        const {query} = req.query;
        if(!query){
            return res.status(400).json({message:"No search query provided"});
        }
        // case - insensitive search
        const userResult = await UserModel.find({
            username: {$regex: query, $options: "i"}
        }).select("username name profilePic");

        const postResult = await PostModel.find({
            caption: {$regex: query, $options: "i"}
        }).select("caption image video")
        .populate("userId","username name profilePic");
        
        return res.status(200).json({userResult, postResult});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Internal server error"});
    }
}