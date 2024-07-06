
const mongoose = require('mongoose')
const { Schema } = mongoose
const loginSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    referral: { type: String },

    phone: { type: String, required: true },
    email: { type: String, required: true },

    password: { type: String, required: true },
    is_active: {
        type: Boolean,
        default: true,
    },
    coupon: { type: String },
    address_id: [
        {
            type: Schema.Types.ObjectId,
            ref: "User_address",
        },
    ],
})

const collection = new mongoose.model("User", loginSchema)
module.exports = collection