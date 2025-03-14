import mongoose from "mongoose";
import mongoosePagination from 'mongoose-paginate-v2'

const publicationSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

publicationSchema.plugin(mongoosePagination)

const Publication = mongoose.model('Publication', publicationSchema)

export default Publication