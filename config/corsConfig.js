import cors from 'cors'

export const corsConfig = () => cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [process.env.FRONTEND_URL, process.env.LOCALHOST_URL]
        if(ACCEPTED_ORIGINS.indexOf(origin) !== -1){
            return callback(null, origin)
        }
        if(!origin){
            return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true 
})