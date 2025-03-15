import User from "../models/user.model.js"
import { generarJwt } from "../utils/generarJwt.js"
import { hashPassword } from "../utils/hashPassword.js"
import bcrypt from 'bcrypt'
import path from 'node:path'
import fs, { stat } from 'node:fs'
import Follow from "../models/follow.model.js"
import { followUserIds } from "../utils/followUserIds.js"
import mongoose from "mongoose"
import Publication from "../models/publication.model.js"


export const register = async (req, res) => {
    const {name, surname, username, email, password} = req.body

    
  
    const existUsername = await User.findOne({username})
    if(existUsername){
        return res.status(400).json({success: false, message: "El username ya esta en uso"})
    }

    const existEmail = await User.findOne({email})
    if(existEmail){
        return res.status(400).json({success: false, message: "El email ya existe"})
    }

    const hashedPassword = await hashPassword(password)

    try{
        const newUser = new User({name, surname, username, email, password: hashedPassword})
        await newUser.save()

        res.json({
            success: true,
            message: "Usuario registrado exitosamente"
        })

    }catch(err){
        console.log("Error in register method: ", err.message)
        res.status(500).json({
            success: false,
            message: "Error al registrar usuario"
        })
    }
}

export const login = async ( req, res) => {
    const {email, password } = req.body

    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({success: false, message: "User not found"})
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) return res.status(400).json({success: false, message: "Password is incorrect"})

        const token = generarJwt({id: user._id, email: user.email})
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            maxAge: 1 * 60 * 60 * 1000,
            secure: true
        })
        res.json({
            success: true,
            message: "Login successfully"
        })

    }catch(err){
        console.log("Error in login method: ", err.message)
        res.status(500).json({success: false, message: "Ha ocurrido un error inesperado, intenta mas tarde"})
    }
    
}

export const logout = (req, res) => {
    res.clearCookie("token").status(200).json({success: true, message: "Ha cerrado sesión"})
}

export const currentUser = async (req, res) => {
    const {user} = req
    res.json(user)
}

export const profile = async (req, res) => {
    const userLoginId = req.user._id
    const {username} = req.params
    const user = await User.findOne({username}).select("-password")
    if(!user){
        return res.status(400).json({message: "User not found", success: false})
    }
    const following = await Follow.findOne({user: userLoginId, followed: user})
    const amIFollowing = following ? true : false

    const following_me = await Follow.findOne({ user: user, followed: userLoginId})
    const areYouFollowingMe = following_me ? true : false

    res.json({success: true, user, amIFollowing, areYouFollowingMe})
}

export const listUsers = async (req, res) => {
    const userId = req.user._id
    let page = Number(req.params.page) || 1
    let itemsPerPage = 5
    const filter = { _id: { $ne: userId } }

    const users = await User.paginate(filter, {
        page,
        limit: itemsPerPage,
        sort: {_id: 1},
        select: "-password"
    })
    const {user_following, user_following_me} = await followUserIds(userId)

    res.json({
        success: true,
        users: users.docs,
        page: page,
        itemsPerPage: users.limit,
        totalItems: users.totalDocs,
        totalPages: users.totalPages,
        user_following,
        user_following_me
    })
}

export const update = async (req, res) => {
    
    const {name, surname, username, email, bio, country, link, position} = req.body
    let userId = req.user._id
    try{

        const user = await User.findById(userId).select("-password")
        if(!user){
            return res.json({success: false, message: "User not found"})
        }

        if(username !== user.username){
            const existUsername = await User.findOne({username})
            if(existUsername){
                return res.status(400).json({success: false, message: "El username ya existe, intenta otro"})
            }
        }

        if(email !== user.email){
            const existEmail = await User.findOne({email})
            if(existEmail){
                return res.status(400).json({success: false, message: "El email ya existe, intenta otro"})
            }
        }

        user.name  = name || user.name
        user.surname = surname || ""
        user.username = username || user.username
        user.email = email || user.email
        user.bio = bio || ""
        user.country = country || ""
        user.link = link || ""
        user.position = position || ""

        const userUpdated = await user.save()
        
        res.json({success: true, user: userUpdated})

    }catch(err){
        console.log("Error in update method: ", err.message)
        res.status(500).json({message: "Ha ocurrido un error inesperado, intenta mas tarde"})
    }

}

export const uploadAvatar = async (req, res) => {
    const {user} = req
    if(!req.file){
        return res.status(400).json({success: false, message: "No has subido ninguna imagen"})
    }
    if(!req.file.mimetype.startsWith("image/")){
        const filePath = req.file.path
        fs.unlinkSync(filePath);
        return res.status(400).json({success: false, message: "Formato de archivo no permitido"})
    }
    const userUpdated = await User.findByIdAndUpdate(
        { _id: user._id },
        { image: req.file.filename },
        { new: true }
    ).select("-password")

    res.json({
        success: true,
        user: userUpdated
    })
}

export const showAvatar = async (req, res) => {
    const {file} = req.params
    const filePath = `./uploads/avatars/${file}`
    fs.stat(filePath, (err) => {
        if(err){
            return res.status(400).json({success: false, message: "No se ha encontrado el archivo"})
        }
        return res.sendFile(path.resolve(filePath))
    })
}

export const counters = async (req, res) => {
    let username = req.params.username ? req.params.username : req.user.username
    try{
        const user = await User.findOne({username: username})
        if(!user){
            return res.status(400).json({success: false, message: "User not found"})
        }
        const following = await Follow.countDocuments({user: user._id})
        const followers = await Follow.countDocuments({followed: user._id})
        const publications = await Publication.countDocuments({user: user._id})

        res.json({
            success: true,
            following,
            followers,
            publications
        })
    }catch(err){
        console.log("Error in counters method: ", err.message)
        res.status(500).json({message: "Ha ocurrido un error inesperado, intenta mas tarde"})
    }
}