import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const checkAuth = async (req, res, next) => {
    const {token} = req.cookies
    if(token == undefined || token == ""){
        return res.status(403).json({message: "Unauthorized: Token not provided"})
    }
    try{
        const {id} = jwt.verify(token, process.env.JWT_SECRET_WORD)
        const user = await User.findById(id).select("-password")
        req.user = user
        next()
    }catch(err){
        res.status(400).json({message: "Invalid token"}) 
    }
}
