const mongoose = require("mongoose")

const { Schema, ObjectId } = mongoose

const Shopping_cartSchema = new Schema({
    User_id: { type: Schema.Types.ObjectId, ref: "User" ,default:null },
})

const Shopping_cart = mongoose.model("Shopping_cart", Shopping_cartSchema)

module.exports = Shopping_cart
