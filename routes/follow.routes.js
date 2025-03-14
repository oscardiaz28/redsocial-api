import { Router } from "express";
import { followers, following, followUser, unfollowUser } from "../controllers/follow.controller.js";
import { checkAuth } from "../middlewares/authMiddleware.js";

export const followRouter = Router()

followRouter.post("/:id", checkAuth, followUser)
followRouter.delete("/:id", checkAuth, unfollowUser)
followRouter.get("/following/:id?/:page?", checkAuth, following)
followRouter.get("/followers/:id?/:page?", checkAuth, followers)

followRouter.use((req, res) => {
    res.status(404).json({success: false, message: "Ruta no definida"})
})