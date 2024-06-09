
const mongoose = require('mongoose')
const loginSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    phone: { type: String, required: true },
    email: { type: String, required: true },

    password: { type: String, required: true },
    is_active: {
        type: Boolean,
        default: true,
    },
})

const collection = new mongoose.model("User", loginSchema)
module.exports = collection