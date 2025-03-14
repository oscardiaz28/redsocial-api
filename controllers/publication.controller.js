import Publication from "../models/publication.model.js";
import fs from 'node:fs'
import mongoose from "mongoose";
import User from "../models/user.model.js";
import path from "node:path";
import Follow from "../models/follow.model.js";
import { populate } from "dotenv";

export const savePublication = async (req, res) => {
    const {user} = req
    const {text} = req.body
    const file = req.file
    if(text === undefined || text === ""){
        return res.status(400).json({success: false, message: "El campo texto es obligatorio"})
    }
    try{
        let imageName;
        if(file){
            const {mimetype, filename} = file
            if( !mimetype.startsWith("image/") && !mimetype.startsWith("video/") ){
                const filePath = req.file.path
                fs.unlinkSync(filePath)
                return res.status(400).json({success: false, message: "Formato no permitido"})
            }
            imageName = filename
        }
        const publication = new Publication({
            text,
            user: user._id,
            created_at: Date.now()
        })

        if(imageName !== null) publication.image = imageName 

        const publicationSaved = await publication.save()
        const pb = await Publication.findOne({_id: publicationSaved._id})
        .populate({path: "user", select: "-password"})

        res.json({
            success: true,
            message: "Publication saved successfully",
            publication: pb
        })

    }catch(err){
        console.log(err)
        console.log(`Error in savePublicatio method: `, err.message)
        return res.status(500).json({success: false, message: "Ha ocurrido un error inesperado, intenta mas tarde"})
    }
}

export const detail = async (req, res) => {
    const {id} = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Publication not found" });
    }
    try{
        const publication = await Publication.findById(id)
        if(!publication) {
            return res.status(400).json({success: false, message: "Publication not found"})
        }
        res.json({
            success: true,
            publication
        })
    }catch(err){
        console.log(err)
        console.log(`Error in savePublicatio method: `, err.message)
        return res.status(500).json({success: false, message: "Ha ocurrido un error inesperado, intenta mas tarde"})
    }
}


export const deletePublication = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({success: false, message: "Publication not found"})
    }
    try{
        const publication = await Publication.findById(id)
        if(!publication){
            return res.status(400).json({success: false, message: "Publication not found"})
        }
        const fileName = `./uploads/posts/${publication.image}`

        console.log(publication.image)
        if( publication?.image !== undefined ){
            fs.unlinkSync(fileName)
        }

        await publication.deleteOne()
        res.json({success: true, message: "Publication deleted successfully"})

    }catch(err){
        console.log(`Error in deletePublication method: `, err.message)
        res.status(500).json({success: false, message: "Ha ocurrido un error, intenta mas tarde"})
    }
}


export const updatePublication = async (req, res) => {

}


export const userPublications = async (req, res) => {
    const userId = req.params.id
    const page = Number(req.params.page) || 1
    const itemsPerPage = 10
    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(400).json({success: false, message: "User not found"})
    }
    try{
        const user = await User.findById(userId)
        if(!user) return res.status(400).json({success: false, message: "User not found"})

        const filter = {
            user: user._id
        }
        const options = {
            page,
            limit: itemsPerPage,
            sort: {created_at: -1},
            populate: [
                {path: "user", select: "-password -created_at -bio -__v"}
            ]
        }
        const data = await Publication.paginate(filter, options)
        res.json({
            posts: data.docs,
            totalItems: data.totalDocs,
            page,
            itemsPerPage,
            totalPages: data.totalPages,
        })

    }catch(err){
        console.log(`Error in userPublications method: `, err.message)
        res.status(500).json({success: false, message: "Ha ocurrido un error inesperado, intentalo mas tarde"})
    }
}

export const getFile = async (req, res) => {
    const {name} = req.params
    const filePath = `./uploads/posts/${name}`
    fs.stat(filePath, (err) => {
        if(err){
            return res.status(400).json({success: false, message: "File not found"})
        }
        res.sendFile(path.resolve(filePath))
    })
}

export const feed = async (req, res) => {
    const {user} = req
    const page = Number(req.params.page) || 1
    const itemsPerPage = 10
    try{
        const following = await Follow.find({user: user._id})
        .then( result => result.map( item => item.followed ) )
        
        const filter = {
            user: { $in: following }
        }
        const options = {
            page,
            limit: itemsPerPage,
            sort: {created_at: -1},
            populate: [{path: "user", select: "-password"}]
        }
        const {docs, totalDocs, totalPages} = await Publication.paginate(filter, options)
        res.json({
            posts: docs,
            totalItems: totalDocs,
            page,
            itemsPerPage,
            totalPages
        })

    }catch(err){
        console.log(`Error in feed method: `, err.message)
        res.status(500).json({success: false, message: "Ha ocurrido un error inesperado, intentalo mas tarde"})
    }
}