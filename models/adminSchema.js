const mongoose = require("mongoose")
const loginSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user: { type: String, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },

    password: { type: String, required: true },
})

const collection = new mongoose.model("Admin", loginSchema)
module.exports = collection
