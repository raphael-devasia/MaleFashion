const mongoose = require("mongoose")

const { Schema, ObjectId } = mongoose

const Product_imageSchema = new Schema({
    Product_variation_id: {
        type: Schema.Types.ObjectId,
        ref: "Product_variation",
        required: true,
    },
    Image_filename: [{ type: String, required: true }],
    Is_active: { type: Boolean, required: true, default: true },
},{timestamps:true})

const Product_image = mongoose.model("Product_image", Product_imageSchema)

module.exports =  Product_image
