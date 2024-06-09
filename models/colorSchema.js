const mongoose = require("mongoose")

const { Schema, ObjectId } = mongoose

const ColourSchema = new Schema({
    Colour_name: { type: String, required: true },
})

const Colour = mongoose.model("Colour", ColourSchema)

module.exports = Colour