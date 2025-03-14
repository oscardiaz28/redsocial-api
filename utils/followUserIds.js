import Follow from "../models/follow.model.js"

export const followUserIds = async (userId) => {

    const user_following = await Follow.find({
        user: userId
    }).select("_id followed")
    .then( result => result.map(followRelation => followRelation.followed) )

    const user_following_me = await Follow.find({
        followed: userId
    }).select("_id user")
    .then( result => result.map(followRelation => followRelation.user) )

    return {
        user_following,
        user_following_me
    }

}
