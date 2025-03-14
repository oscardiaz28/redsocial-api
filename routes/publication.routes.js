import { Router } from "express";
import { deletePublication, detail, feed, getFile, savePublication, userPublications } from "../controllers/publication.controller.js";
import { checkAuth } from "../middlewares/authMiddleware.js";
import multer from 'multer'
import path from 'node:path'

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads/posts")
    },
    filename: function(req, file, cb){
        const name = `${Date.now()}${path.extname(file.originalname)}`
        cb(null, name)
    }
})

const upload = multer({storage})

export const publicationRouter = Router()

publicationRouter.post("/", [checkAuth, upload.single('image')], savePublication)
publicationRouter.get("/detail/:id", checkAuth, detail)
publicationRouter.delete("/:id", checkAuth, deletePublication)

publicationRouter.get("/user/:id/:page?", checkAuth, userPublications)
publicationRouter.get("/file/:name", checkAuth, getFile)

publicationRouter.get("/feed/:page?", checkAuth, feed)


publicationRouter.use((req, res) => {
    res.status(400).json({success: false, message: "Ruta no definida"})
})