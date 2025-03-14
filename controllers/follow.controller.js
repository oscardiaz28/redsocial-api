import Follow from "../models/follow.model.js";
import User from "../models/user.model.js";
import { followUserIds } from "../utils/followUserIds.js";

export const followUser = async (req, res) => {
    const {user} = req
    const {id} = req.params
    try{
        if(id === user._id.toString()){
            return res.status(400).json({success: false, message: "You can't follow yourself"})
        }
        const userToFollow = await User.findById(id)
        if(!userToFollow){
            return res.status(400).json({success: false, message: "User not found"})
        }
        const existFollow = await Follow.findOne({
            $and: [ { user: user._id }, {followed: userToFollow._id} ]
        })
        if(existFollow){
            return res.status(400).json({success: false, message: `Ya lo estas siguiendo`})
        }
        const follow = new Follow({
            user: user._id,
            followed: userToFollow._id
        })
        await follow.save()
        res.json({success: true, message: "Follow exitoso"})

    }catch(err){
        console.log("Error in followUser method: ", err.message)
        res.status(500).json({success: false, message: "Ha ocurrido un error inesperado, intenta mas tarde"})
    }
}

export const unfollowUser = async (req, res) => {
    const {user} = req
    const {id} = req.params
    try{
        if(id === user._id.toString()){
            return res.status(400).json({success: false, message: "You can't unfollow yourself"})
        }
        const userToUnFollow = await User.findById(id)
        if(!userToUnFollow){
            return res.status(400).json({success: false, message: "User not found"})
        }
        const unfollow = await Follow.findOne({
            $and: [ { user: user._id }, { followed: userToUnFollow._id } ]
        })
        if(!unfollow){
            return res.status(400).json({success: false, message: "No lo estas siguiendo"})
        }
        await unfollow.deleteOne()
        res.json({success: true, message: "Ya no estas siguiendo"})
        
    }catch(err){
        res.status(500).json({success: false, message: "Ha ocurrido un error inesperado, intenta mas tarde"})
    }
}

//listado de following
export const following = async (req, res) => {
    let userId = req.user._id
    if(req.params.id) userId = req.params.id
    const page = Number(req.params.page) || 1
    const itemsPerPage = 5
    try{
        const filter = {user: userId.toString()}
        const options = {
            page,
            limit: itemsPerPage,
            select: ("-__v"),
            sort: {created_at: -1},
            populate: [
                {path: "followed", select: "-password"}
            ]
        }
        const data = await Follow.paginate(filter, options)
        const follows = data.docs.map( elem => elem.followed )

        const {user_following, user_following_me} = await followUserIds(userId)

        res.json({
            follows,
            totalItems: data.totalDocs,
            totalPages: data.totalPages,
            page: page,
            user_following: user_following,
            user_following_me: user_following_me
        })
        
    }catch(err){
        console.log("Error in following method: ", err.message)
        res.status(500).json({success: false, message: "Ha ocurrido un error inesperado, intenta mas tarde"})
    }
}

//listado de followers
export const followers = async (req, res) => {
    let userId = req.user._id
    if(req.params.id) userId = req.params.id
    const page = Number(req.params.page) || 1
    const itemsPerPage = 5
    try{
        const filter = {followed: userId.toString()}
        const options = {
            page,
            limit: itemsPerPage,
            select: ("-__v"),
            sort: {created_at: -1},
            populate: [
                {path: "user", select: "-password"}
            ]
        }
        const data = await Follow.paginate(filter, options)
        const followers = data.docs.map( elem => elem.user )
        const {user_following, user_following_me} = await followUserIds(userId)

        res.json({
            followers: followers,
            totalItems: data.totalDocs,
            totalPages: data.totalPages,
            page: page,
            user_following: user_following,
            user_following_me: user_following_me
        })
        
    }catch(err){
        console.log("Error in following method: ", err.message)
        res.status(500).json({success: false, message: "Ha ocurrido un error inesperado, intenta mas tarde"})
    }

}

