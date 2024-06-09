// const mongoose = require("mongoose")

// const { Schema, ObjectId } = mongoose

// const Product_variationSchema = new Schema({
//     Product_item_id: {
//         type: Schema.Types.ObjectId,
//         ref: "Product_item",
//         required: true,
//     },
//     Size_id: {
//         type: Schema.Types.ObjectId,
//         ref: "Size_option",
//         required: true,
//     },
//     Qty_in_stock: { type: String,required: true, },
//     Is_active: { type: Boolean,required: true, default:true },
// })

// const Product_variation = mongoose.model(
//     "Product_variation",
//     Product_variationSchema
// )

// module.exports =  Product_variation
const mongoose = require("mongoose")
const { Schema } = mongoose

const productVariationSchema = new Schema({
    Product_item_id: {
        type: Schema.Types.ObjectId,
        ref: "Product_item",
        required: true,
    },
    Size_id: {
        type: Schema.Types.ObjectId,
        ref: "SizeOption", // Reference the model name
        required: true,
    },
    Qty_in_stock: { type: String, required: true },
    Is_active: { type: Boolean, required: true, default: true },
})

const ProductVariation = mongoose.model(
    "Product_variation",
    productVariationSchema
)

module.exports = ProductVariation
