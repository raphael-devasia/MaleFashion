const mongoose = require("mongoose")
const Product = require("../models/products")
const { Schema, ObjectId } = mongoose

const Product_itemSchema = new Schema({
    Product_id: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    Colour_id: {
        type: Schema.Types.ObjectId,
        ref: "Colour",
        required: true,
    },
    Original_price: { type: Number, required: true },
    // Sale_price: { type: Number ,required: true },
    Product_sku: { type: String,required: true  },
})

const Product_item = mongoose.model("Product_item", Product_itemSchema)

module.exports = Product_item
