const mongoose = require("mongoose")

const { Schema, ObjectId } = mongoose

const Order_statusSchema = new Schema({
    Status: { type: String ,default:"Processing"},
},{timestamps:true})

const Order_status = mongoose.model("Order_status", Order_statusSchema)

module.exports= Order_status
