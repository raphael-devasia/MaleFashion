const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
     _id: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });


const GoogleUser = mongoose.model("GoogleUser", userSchema)

module.exports = GoogleUser
