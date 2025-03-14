import mongoose from "mongoose";

const connection = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Conectado a la bd")
    }catch(err){
        console.log("No se ha podido conectar a la bd :", err.message)
    }
}

export default connection