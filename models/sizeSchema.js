const mongoose = require("mongoose")
const { Schema } = mongoose

const sizeOptionSchema = new Schema({
    Sort_order: { type: String, required: true },
    Size_name: { type: String, required: true },
    Size_category_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "SizeCategory",
    },
})

const SizeOption = mongoose.model("SizeOption", sizeOptionSchema)

module.exports = SizeOption
