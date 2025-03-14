import { Router } from "express";
import { login, logout, register } from "../controllers/user.controller.js";
import { validateLogin, validateRegister } from "../middlewares/validations.js";

export const authRouter = Router()

authRouter.post("/register", validateRegister, register)
authRouter.post("/login", validateLogin, login)
authRouter.post("/logout", logout)