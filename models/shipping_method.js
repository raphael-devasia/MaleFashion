const mongoose = require("mongoose")

const { Schema, ObjectId } = mongoose

const Shipping_methodSchema = new Schema({
    Name: { type: String },
    Price: { type: Double },
})

const Shipping_method = mongoose.model("Shipping_method", Shipping_methodSchema)

module.exports= Shipping_method
