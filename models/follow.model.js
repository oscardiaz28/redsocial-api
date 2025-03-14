import mongoose from "mongoose";
import mongoosePagination from 'mongoose-paginate-v2'

const followSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    followed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
})

followSchema.plugin(mongoosePagination)

const Follow = mongoose.model('Follow', followSchema)

export default Follow