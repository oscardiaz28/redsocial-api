import mongoose from "mongoose";
import mongoosePagination from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: ""
    },
    position: {
        type: String,
        default: ""
    },
    image:{
        type: String,
        default: "avatar-default.png"
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
})

userSchema.plugin(mongoosePagination)

const User = mongoose.model('User', userSchema)

export default User

