const mongoose = require("mongoose")
const { Schema } = mongoose

const Size_categorySchema = new Schema({
    Category_name: { type: String, required: true },
})

const Size_category = mongoose.model("Size_category", Size_categorySchema)

module.exports = Size_category
