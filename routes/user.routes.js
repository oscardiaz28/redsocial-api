import {Router} from 'express'
import { counters, currentUser, listUsers, profile, showAvatar, update, uploadAvatar } from '../controllers/user.controller.js'
import { checkAuth } from '../middlewares/authMiddleware.js'
import multer from 'multer'
import path from 'node:path'

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads/avatars")
    },
    filename: function(req, file, cb){
        cb(null, "avatar-"+Date.now()+"-"+file.originalname)
    }
})

const upload = multer({storage})

export const userRouter = Router()

userRouter.get("/profile", checkAuth, currentUser)
userRouter.get("/profile/:username", checkAuth, profile)
userRouter.get("/list/:page?", checkAuth, listUsers)

userRouter.put("/", checkAuth, update)
userRouter.post("/avatar", [checkAuth, upload.single('avatar')], uploadAvatar)
userRouter.get("/avatar/:file", showAvatar)

userRouter.get("/counters/:username?", checkAuth, counters)

userRouter.use((req, res) => {
    res.status(404).json({success: false, message: "Ruta no definida"})
})