import dotenv from 'dotenv'
import express from 'express'
import { PORT } from './config/config.js'
import conexionDb from './database/connection.js'
import morgan from 'morgan'
import { corsConfig } from './config/corsConfig.js'
import { authRouter } from './routes/auth.routes.js'
import { userRouter } from './routes/user.routes.js'
import cookieParser from 'cookie-parser'
import { followRouter } from './routes/follow.routes.js'
import { publicationRouter } from './routes/publication.routes.js'

const app = express()
dotenv.config()
conexionDb()

app.use(corsConfig())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.json({message: "Server with nodejs"})
})

app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/follows", followRouter)
app.use("/api/publications", publicationRouter)

app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`)
})